import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth', () => {
  it('should be provided', () => {
    expect(TestBed.inject(Auth)).toBeTruthy();
  });
});
