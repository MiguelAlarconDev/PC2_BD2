import { Injectable, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nmjyahwaqgbwqwsqyyiu.supabase.co',
  'sb_publishable_B0bro7kCRunryfb2nE0RAw_4qYR1Iuu'
);

@Injectable({ providedIn: 'root' })
export class Auth {
  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async getUser() {
    return supabase.auth.getUser();
  }

  async logout() {
    return supabase.auth.signOut();
  }
}
