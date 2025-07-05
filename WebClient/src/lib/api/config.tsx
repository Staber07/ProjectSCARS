import { GetAccessTokenHeader } from "@/lib/utils/token";
import { getServerConfigV1AdminConfigGet, updateServerConfigV1AdminConfigPut } from "@/lib/api/csclient";

export interface ServerConfig {
    debug: {
        enabled: boolean;
        logenv_optout: boolean;
        show_sql: boolean;
        hot_reload: boolean;
    };
    connection: {
        host: string;
        port: number;
        base_url: string;
    };
    logging: {
        filepath: string;
        max_bytes: number;
        backup_count: number;
        encoding: string;
        log_format: string;
        date_format: string;
    };
    security: {
        allow_origins: string[];
        allow_credentials: boolean;
        allow_methods: string[];
        allow_headers: string[];
        failed_login_notify_attempts: number;
        failed_login_lockout_attempts: number;
        failed_login_lockout_minutes: number;
    };
    mailing: {
        enabled: boolean;
        server: string;
        port: number;
        from_address: string;
        username: string;
        templates_dir: string;
        templates_encoding: string;
    };
    authentication: {
        signing_algorithm: string;
        encryption_algorithm: string;
        encrypt_jwt: boolean;
        encoding: string;
        access_token_expire_minutes: number;
        refresh_token_expire_minutes: number;
        recovery_token_expire_minutes: number;
        otp_nonce_expire_minutes: number;
    };
}

export interface ConfigUpdateRequest {
    config: Partial<ServerConfig>;
}

export const GetServerConfig = async (): Promise<ServerConfig> => {
    const result = await getServerConfigV1AdminConfigGet({
        headers: {
            Authorization: GetAccessTokenHeader(),
        },
    });

    if (result.error) {
        throw new Error(
            `Failed to fetch server configuration: ${result.response.status} ${result.response.statusText}`
        );
    }

    return result.data as unknown as ServerConfig;
};

export const UpdateServerConfig = async (configUpdate: ConfigUpdateRequest): Promise<{ message: string }> => {
    const result = await updateServerConfigV1AdminConfigPut({
        headers: {
            Authorization: GetAccessTokenHeader(),
        },
        body: configUpdate,
    });

    if (result.error) {
        throw new Error(
            `Failed to update server configuration: ${result.response.status} ${result.response.statusText}`
        );
    }

    return result.data as { message: string };
};
