import { ValidSpaceNameValidatorDirective } from './src/app/spaces/valid-space-name.directive';
import { ValidSpaceAssignedIdValidatorDirective } from './src/app/spaces/valid-space-assigned-id.directive';

import { SpaceNamePipe } from './src/app/spaces/space-name.pipe';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
  ],
  declarations: [
    SpaceNamePipe,
    ValidSpaceNameValidatorDirective,
    ValidSpaceAssignedIdValidatorDirective
  ],
  exports: [
    SpaceNamePipe,
    ValidSpaceNameValidatorDirective,
    ValidSpaceAssignedIdValidatorDirective
  ],
  providers: [
    SpaceNamePipe
  ]
})
export class OpenfactSyncModule {
}
