import * as client from "openid-client";
import { env } from "./env";

const server = new URL(env.authServerUrl!); // Authorization Server's Issuer Identifier
const clientId = env.clientId!; // Client identifier at the Authorization Server
const getRedirectUri = () => `${window.location.origin}/login/oauth2/code/react-client`;

let config: client.Configuration | undefined = undefined;

/**
 * Discovers and returns the OpenID Connect configuration from the server.
 * Results are cached in the 'config' variable.
 */
export async function getAuthConfig() {
    if (config) return config;

    if (!env.authServerUrl) {
        throw new Error("VITE_AUTH_SERVER_URL is not defined in environment variables");
    }

    return (config = await client.discovery(
        server,
        clientId,
        {
            id_token_signed_response_alg: "ES256",
        },
        undefined, // clientAuth
        {
            execute: [client.allowInsecureRequests],
            algorithm: "oidc",
        }
    ));
}

/**
 * Initiates the Authorization Code Flow by redirecting the user to the auth server.
 * Handles PKCE generation and storage.
 */
export async function authCodeFlow(
    setState: (state: string) => void,
    setCodeVerifier: (codeVerifier: string) => void
) {
    const config = await getAuthConfig();

    const redirect_uri = getRedirectUri();
    const scope = "openid email profile";

    // Generate PKCE values
    const code_verifier = client.randomPKCECodeVerifier();
    setCodeVerifier(code_verifier);
    let code_challenge: string =
        await client.calculatePKCECodeChallenge(code_verifier);

    let parameters: Record<string, string> = {
        redirect_uri,
        scope,
        code_challenge,
        code_challenge_method: "S256",
    };

    if (!config.serverMetadata().supportsPKCE()) {
        /**
         * Fallback to state if PKCE is not explicitly supported.
         * PKCE is still used as it is backwards compatible.
         */
        const state = client.randomState();
        setState(state);
        parameters.state = state;
    }

    let redirectTo: URL = client.buildAuthorizationUrl(config, parameters);
    window.location.href = redirectTo.href;
}

/**
 * Exchanges the authorization code for access and ID tokens.
 */
export async function tokenExchange(
    getCurrentUrl: (...args: any) => URL,
    state: string,
    code_verifier: string
) {
    const config = await getAuthConfig();
    const redirect_uri = getRedirectUri();

    let tokens: client.TokenEndpointResponse =
        await client.authorizationCodeGrant(config, getCurrentUrl(), {
            pkceCodeVerifier: code_verifier,
            expectedState: state,
        }, {
            redirect_uri
        });

    return tokens;
}

/**
 * Fetches user information using the access token.
 */
export async function userInfo(access_token: string, sub: string) {
    const config = await getAuthConfig();
    let userInfo = await client.fetchUserInfo(config, access_token, sub);

    return userInfo;
}

/**
 * Performs a sign-out by redirecting the user to the end_session_endpoint.
 */
export async function signOutRedirect(id_token?: string) {
    const config = await getAuthConfig();
    const endSessionEndpoint = config.serverMetadata().end_session_endpoint;

    if (!endSessionEndpoint) {
        console.warn("No end_session_endpoint found in discovery document");
        return;
    }

    let url = new URL(endSessionEndpoint);
    if (id_token) {
        url.searchParams.set("id_token_hint", id_token);
    }

    // Redirect back to application root after logout
    url.searchParams.set("post_logout_redirect_uri", window.location.origin);

    window.location.href = url.href;
}
