import { Component, Input, OnInit } from '@angular/core';
import { Highlight } from 'src/app/core/models/highlight.model';

@Component({
  selector: 'app-highlight-list',
  templateUrl: './highlight-list.component.html',
  styleUrls: ['./highlight-list.component.scss'],
  standalone: false,
})
export class HighlightListComponent implements OnInit {
  @Input() highlightList: Highlight[] = [];
  @Input() isLoaded: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
