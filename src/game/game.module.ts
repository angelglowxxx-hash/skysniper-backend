// src/game/game.module.ts
// -----------------------------------------------------------------------------
// This module bundles all components related to core game interactions.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
