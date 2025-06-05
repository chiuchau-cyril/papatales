/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_login_auth_login_post } from '../models/Body_login_auth_login_post';
import type { UserCreate } from '../models/UserCreate';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Register
     * 註冊新用戶
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public registerAuthRegisterPost({
        requestBody,
    }: {
        requestBody: UserCreate,
    }): CancelablePromise<UserResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * 用戶登入
     * @returns any Successful Response
     * @throws ApiError
     */
    public loginAuthLoginPost({
        formData,
    }: {
        formData: Body_login_auth_login_post,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
