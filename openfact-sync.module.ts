import { ValidSpaceNameValidatorDirective } from './src/app/spaces/valid-space-name.directive';
import { ValidSpaceAssignedIdValidatorDirective } from './src/app/spaces/valid-space-assigned-id.directive';
import { UniqueSpaceAssignedIdValidatorDirective } from './src/app/spaces/unique-space-assigned-id.directive';

import { SpaceNamePipe } from './src/app/spaces/space-name.pipe';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
  ],
  declarations: [
    SpaceNamePipe,
    ValidSpaceNameValidatorDirective,
    ValidSpaceAssignedIdValidatorDirective,
    UniqueSpaceAssignedIdValidatorDirective
  ],
  exports: [
    SpaceNamePipe,
    ValidSpaceNameValidatorDirective,
    ValidSpaceAssignedIdValidatorDirective,
    UniqueSpaceAssignedIdValidatorDirective
  ],
  providers: [
    SpaceNamePipe
  ]
})
export class OpenfactSyncModule {
}
