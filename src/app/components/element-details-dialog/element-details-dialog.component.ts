import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-element-details-dialog',
  templateUrl: './element-details-dialog.component.html',
  styleUrls: ['./element-details-dialog.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatInputModule ],
})
export class ElementDetailsDialogComponent implements OnInit {
  detailsForm!: FormGroup; // Don't initialize here
  title: string = 'Add Item';
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ElementDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (!this.data) {
      console.error('No data was passed to dialog!');
      return;
    }

    this.title = `Add ${this.data?.item?.name || 'Item'}`;
    this.detailsForm = this.createFormGroup();
  }

  private createFormGroup(): FormGroup {
    const formGroup: any = {};

    if (this.data && this.data.context && this.data.context.fields) {
      this.data.context.fields.forEach((field: string) => {
        formGroup[this.getControlName(field)] = ['', Validators.required];
      });
    } else {
      formGroup['name'] = ['', Validators.required];
      formGroup['description'] = [''];
    }

    return this.fb.group(formGroup);
  }

  getControlName(field: string): string {
    return field
      .toLowerCase()
      .replace(/\s(.)/g, $1 => $1.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, $1 => $1.toLowerCase());
  }

  getDisplayName(controlName: string): string {
    const result = controlName.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  onSubmit() {
    if (this.detailsForm.valid) {
      this.dialogRef.close(this.detailsForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getFormControls() {
    console.log(this.detailsForm.controls);
    console.log(Object.keys(this.detailsForm.controls));

    return Object.keys(this.detailsForm.controls);
  }
}
