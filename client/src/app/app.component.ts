import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {environment} from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent {
  title = 'MP4 to GIF Converter';
  fileToUpload: File | null = null;
  isUploading: boolean = false;
  progress: number = 0;
  message: string = '';
  gifUrl: string = '';
  conversionId: string | null = null;
  conversionStatusInterval: any;
  fileName: string = '';

  constructor(private http: HttpClient) {}

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
      this.fileName = this.fileToUpload.name;
    }else {
      this.fileName = '';
    }
  }

  onUpload() {
    if (!this.fileToUpload) {
      alert('Please select a file.');
      return;
    }

    this.isUploading = true;
    this.progress = 0;
    this.message = '';
    this.gifUrl = '';

    const formData = new FormData();
    formData.append('file', this.fileToUpload);

    this.http.post<any>(`${environment.apiHost}/upload`, formData, {
      headers: new HttpHeaders(),
      observe: 'body',
    }).pipe(
      tap(response => {
        this.conversionId = response.requestId;
        this.checkConversionStatus();
      }),
      catchError((error) => {
        this.isUploading = false;
        this.message = `Error occurred during upload or conversion: ${error.error.error}`;
        return [];
      })
    ).subscribe();
  }

  checkConversionStatus() {
    if (!this.conversionId) return;

    this.conversionStatusInterval = setInterval(() => {
      this.http.get<any>(`${environment.apiHost}/status/${this.conversionId}`).pipe(
        tap(data => {
          if (data?.gifUrl) {
            this.isUploading = false;
            this.gifUrl = data?.gifUrl;
            this.message = 'Conversion complete!';
            clearInterval(this.conversionStatusInterval);
          } else {
            this.isUploading = true;
            this.message = 'Converting...';
          }
        }),
        catchError(() => {
          this.isUploading = false;
          this.message = 'Error checking conversion status.';
          clearInterval(this.conversionStatusInterval);
          return [];
        })
      ).subscribe();
    }, 2000);
  }
}
