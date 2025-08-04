// src/views/views.module.ts
// -----------------------------------------------------------------------------
// This module bundles the ViewsService, which is responsible for rendering
// server-side HTML for the admin panel.
// -----------------------------------------------------------------------------

import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';

@Module({
  providers: [ViewsService],
  exports: [ViewsService], // Export the service so other modules can use it.
})
export class ViewsModule {}
