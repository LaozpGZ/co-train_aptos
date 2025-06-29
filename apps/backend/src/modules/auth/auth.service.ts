import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { WalletLoginDto } from './dto/wallet-login.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { Aptos, AptosConfig, Network, Ed25519PublicKey, Ed25519Signature } from '@aptos-labs/ts-sdk';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, walletAddress } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (walletAddress) {
      const existingWalletUser = await this.usersService.findByWalletAddress(walletAddress);
      if (existingWalletUser) {
        throw new ConflictException('User with this wallet address already exists');
      }
    }

    // Create user
    const user = await this.usersService.create(registerDto);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Please use wallet login for this account');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async walletLogin(walletLoginDto: WalletLoginDto): Promise<AuthResponse> {
    const { walletAddress, signature, message } = walletLoginDto;

    // Verify wallet signature
    const isSignatureValid = await this.verifyWalletSignature(
      walletAddress,
      signature,
      message,
    );

    if (!isSignatureValid) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // Find or create user
    let user = await this.usersService.findByWalletAddress(walletAddress);
    
    if (!user) {
      // Create new user with wallet address
      user = await this.usersService.create({
        email: `${walletAddress}@wallet.local`,
        walletAddress,
        username: `user_${walletAddress.slice(-8)}`,
      });
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = await this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });
  }

  private async verifyWalletSignature(
    walletAddress: string,
    signature: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Basic validation
      if (!walletAddress || !signature || !message) {
        return false;
      }

      // Initialize Aptos client
      const config = new AptosConfig({ network: Network.MAINNET });
      const aptos = new Aptos(config);

      // Convert signature from hex string to Ed25519Signature
      const signatureBytes = new Uint8Array(
        signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      const ed25519Signature = new Ed25519Signature(signatureBytes);

      // Get public key from wallet address
      const accountInfo = await aptos.getAccountInfo({ accountAddress: walletAddress });
      const publicKeyHex = accountInfo.authentication_key;
      
      // Convert public key from hex to Ed25519PublicKey
      const publicKeyBytes = new Uint8Array(
        publicKeyHex.slice(2).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      const publicKey = new Ed25519PublicKey(publicKeyBytes);

      // Verify the signature
      const messageBytes = new TextEncoder().encode(message);
      const isValid = publicKey.verifySignature({
        message: messageBytes,
        signature: ed25519Signature,
      });

      return isValid;
    } catch (error) {
      console.error('Wallet signature verification failed:', error);
      return false;
    }
  }

  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      fullName: user.fullName,
      displayName: user.displayName,
    };
  }
}