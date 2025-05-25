import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import type { LoginPayload, LoginWithOtpCodePayload } from './types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
  });
};


export const useLoginWithOtpCode = () => {
  return useMutation({
    mutationFn: (payload: LoginWithOtpCodePayload) => authApi.loginWithOtpCode(payload),
  });
};