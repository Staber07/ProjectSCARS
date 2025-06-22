# Enabling Open Authentication (OAuth)

## Google OAuth

To enable linking a user's account with Google OAuth, follow the steps below:

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com/).
2. Create a new project if needed. Otherwise, select an existing project.
3. Navigate to _Google Auth Platform_ and click "Get Started".
4. Follow the steps displayed in the page.
5. After setting up the OAuth configuration, create a new OAuth client.
6. Set the _Application Type_ to "Web application".
7. Set the _Authorized JavaScript origins_ to the web client base URL.
8. Set the _Authorized redirect URIs_ to the central server base URL.
9. Get the client ID and client secret and paste it to `config.json`.

```jsonc
{
    /* ... */
    "authentication": {
        "oauth": {
            "google": {
                "client_id": "UPDATE_THIS_VALUE",
                "client_secret": "UPDATE_THIS_VALUE",
                "redirect_uri": "http://localhost:8080/login/oauth/google"
            }
        }
    }
    /* ... */
}
```

## Microsoft OAuth

This has not yet been implemented.

## Facebook OAuth

This has not yet been implemented.
