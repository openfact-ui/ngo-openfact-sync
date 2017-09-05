import { Observable, Subject } from 'rxjs';
import { SimpleChanges, OnChanges, Directive, Input, forwardRef } from '@angular/core';
import {
  AbstractControl,
  Validators,
  Validator,
  NG_ASYNC_VALIDATORS,
  AsyncValidatorFn
} from '@angular/forms';

@Directive({
  selector: '[validSpaceAssignedId][ngModel]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => ValidSpaceAssignedIdValidatorDirective), multi: true
  }]
})
export class ValidSpaceAssignedIdValidatorDirective implements Validator, OnChanges {

  static readonly ALLOWED_SPACE_NAMES = /^[a-z\d][a-z\d\s-_]*[a-z\d]$/i;
  static readonly MIN_SPACE_NAME_LENGTH = 4;
  static readonly MAX_SPACE_NAME_LENGTH = 63;


  @Input() validSpaceAssignedId: boolean;

  private valFn: any;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['validSpaceAssignedId'];
    if (change) {
      this.valFn = validSpaceAssignedIdValidator();
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl): Observable<{ [key: string]: any }> {
    return this.valFn(control);
  }

}

export function validSpaceAssignedIdValidator(): AsyncValidatorFn {

  let changed$ = new Subject<any>();

  return (control: AbstractControl): Observable<{ [key: string]: any }> => {
    changed$.next();
    return control.valueChanges
      .debounceTime(50)
      .distinctUntilChanged()
      .takeUntil(changed$)
      .map(value => {
        // tslint:disable-next-line:max-line-length
        if (!control.value || control.value.toString().length > ValidSpaceAssignedIdValidatorDirective.MAX_SPACE_NAME_LENGTH) {
          return {
            maxLength: {
              valid: false,
              requestedName: control.value,
              max: ValidSpaceAssignedIdValidatorDirective.MAX_SPACE_NAME_LENGTH
            }
          };
        }
        let strVal: string = control.value.toString();
        if (strVal.length < ValidSpaceAssignedIdValidatorDirective.MIN_SPACE_NAME_LENGTH) {
          return {
            minLength: {
              valid: false,
              requestedName: control.value,
              min: ValidSpaceAssignedIdValidatorDirective.MIN_SPACE_NAME_LENGTH
            }
          };
        } else if (!strVal.match(ValidSpaceAssignedIdValidatorDirective.ALLOWED_SPACE_NAMES)) {
          return {
            invalid: {
              valid: false,
              requestedName: control.value,
              allowedChars: ValidSpaceAssignedIdValidatorDirective.ALLOWED_SPACE_NAMES
            }
          };
        }
        return null;
      })
      .first();
  };
}
