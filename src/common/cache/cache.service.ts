// src/common/cache/cache.service.ts
// -----------------------------------------------------------------------------
// This service provides a high-speed caching layer using Redis. It abstracts
// the complexities of Redis, offering simple get/set/del methods for use
// throughout the application.
// -----------------------------------------------------------------------------

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly redisClient: Redis;

 // src/common/cache/cache.service.ts (UPDATED CONSTRUCTOR)

constructor(private readonly configService: ConfigService) {
  // Get the full Redis URL from environment variables.
  const redisUrl = this.configService.get<string>('REDIS_URL');
  if (!redisUrl) {
    throw new Error('FATAL_ERROR: REDIS_URL is not defined in environment variables.');
  }

  // Initialize the Redis client with the single URL.
  this.redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });

  console.log('⚪️ Cache Service: Redis client initialized.');
}
  // On initialization, ping the Redis server to confirm a successful connection.
  async onModuleInit() {
    try {
      await this.redisClient.ping();
      console.log('⚪️ Cache Service: Successfully connected to Redis.');
    } catch (error) {
      console.error('🔴 Cache Service: Failed to connect to Redis.', error);
    }
  }

  // On application shutdown, gracefully disconnect the Redis client.
  async onModuleDestroy() {
    await this.redisClient.quit();
    console.log('⚪️ Cache Service: Successfully disconnected from Redis.');
  }

  /**
   * Retrieves a value from the cache for a given key.
   * Automatically parses JSON strings into objects.
   * @param key The key to retrieve.
   * @returns The cached value, or null if not found.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) {
      return null;
    }
    try {
      // Attempt to parse the value as JSON, falling back to the raw value if it's not valid JSON.
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  /**
   * Stores a value in the cache.
   * Automatically stringifies objects before storing.
   * @param key The key to store the value under.
   * @param value The value to store (can be any serializable type).
   * @param ttlSeconds Optional Time-To-Live in seconds for the key.
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<'OK'> {
    const stringifiedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      // Use the 'EX' option to set an expiration time.
      return this.redisClient.set(key, stringifiedValue, 'EX', ttlSeconds);
    } else {
      return this.redisClient.set(key, stringifiedValue);
    }
  }

  /**
   * Deletes a key and its value from the cache.
   * @param key The key to delete.
   */
  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
