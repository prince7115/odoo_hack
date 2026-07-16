export class PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;

  constructor(
    content: T[],
    page: number,
    size: number,
    totalElements: number,
    totalPages: number,
    last: boolean,
  ) {
    this.content = content;
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
    this.last = last;
  }
}
