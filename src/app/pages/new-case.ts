import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CaseStore } from '../services/case-store';
import { DirectoryService } from '../services/directory.service';
import { InvestigationCase, Priority } from '../models';

const minTrimmed =
  (length: number): ValidatorFn =>
  (control) =>
    typeof control.value === 'string' && control.value.trim().length >= length
      ? null
      : { minTrimmed: true };

@Component({
  selector: 'app-new-case',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-case.html',
})
export class NewCase {
  readonly store = inject(CaseStore);
  readonly directory = inject(DirectoryService);
  private readonly fb = inject(FormBuilder);
  readonly savedCase = signal<InvestigationCase | null>(null);
  readonly form = this.fb.nonNullable.group({
    title: ['', [minTrimmed(4), Validators.maxLength(100)]],
    location: ['', [minTrimmed(2), Validators.maxLength(80)]],
    priority: this.fb.nonNullable.control<Priority>('Média', Validators.required),
    description: ['', [minTrimmed(15), Validators.maxLength(2000)]],
    suspectIds: this.fb.nonNullable.control<number[]>([]),
  });
  // Eventos do formulário tornam validade, valores e toques reativos nos computed.
  private readonly formEvents = toSignal(this.form.events);
  readonly canSubmit = computed(() => {
    this.formEvents();
    return this.form.valid && !this.savedCase();
  });
  readonly selectedIds = computed(() => {
    this.formEvents();
    return this.form.controls.suspectIds.value;
  });
  readonly descriptionLength = computed(() => {
    this.formEvents();
    return this.form.controls.description.value.length;
  });

  hasError(field: 'title' | 'location' | 'description'): boolean {
    this.formEvents();
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }
  toggleSuspect(id: number): void {
    const control = this.form.controls.suspectIds;
    control.setValue(
      control.value.includes(id)
        ? control.value.filter((value) => value !== id)
        : [...control.value, id],
    );
    control.markAsDirty();
  }
  submit(): void {
    if (this.savedCase()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    this.savedCase.set(
      this.store.addCase({
        ...values,
        title: values.title.trim(),
        location: values.location.trim(),
        description: values.description.trim(),
      }),
    );
  }
}
