# Central Server SMTP Connection

To enable email notifications, password resets, and other email-related
functionality, you have to connect the central server to an SMTP server.

## Gmail SMTP Connection

The most basic approach is to use Gmail as the SMTP server. Just follow
the instructions in the link below to create an _app password_:

[https://support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833?hl=en)

This is a 16-character-long string, grouped by 4 characters and separated by spaces.
Remove the spaces and you will get your app password.
After you have successfully created an app password, update your
configuration file:

```jsonc
{
    /* ... */
    "mailing": {
        "enabled": true,
        "server": "smtp.gmail.com",
        "port": 587,
        "from_address": "your_username@gmail.com",
        "username": "your_username@gmail.com",
        "password": "your-app-password"
    }
    /* ... */
}
```
