import {createAsyncThunk} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';

import {ApiUrl, AppRoute} from '@/constants';
import {dropToken, saveToken} from '@/services/token';
import {getFavorite} from '@/store/film/api-actions';

import {AuthData, LoginError, UserData} from '@/types';
import {ThunkOptions} from '@/types/state';
import {clearFavorite} from '@/store/film/film';

export const checkAuth = createAsyncThunk<UserData, undefined, ThunkOptions>(
  'user/checkAuth',
  async (_arg, { extra: { api}, dispatch}) => {
    const {data} = await api.get<UserData>(ApiUrl.Login);
    dispatch(getFavorite());

    return data;
  },
);

export const login = createAsyncThunk<UserData | LoginError, AuthData, ThunkOptions>(
  'user/login',
  async (payload, { extra: { api}, dispatch, rejectWithValue}) => {
    try {
      const {data} = await api.post<UserData>(ApiUrl.Login, payload);
      saveToken(data.token);
      dispatch(getFavorite());

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data);
      }
      return rejectWithValue(error);
    }
  },
);

export const logout = createAsyncThunk<void, undefined, ThunkOptions>(
  'user/logout',
  async (_arg, { extra: { api, router}, dispatch}) => {
    await api.delete(ApiUrl.Logout);
    dispatch(clearFavorite());
    dropToken();
    router.navigate(AppRoute.MainPage);
  },
);
