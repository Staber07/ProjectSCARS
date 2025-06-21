from dataclasses import dataclass

from centralserver.internals.adapters.config import (
    GoogleOAuthAdapterConfig,
    OAuthAdapterConfig,
)


@dataclass
class OAuthConfigs:
    google: GoogleOAuthAdapterConfig | None = None
    # TODO: The two adapters below are not implemented yet.
    microsoft: OAuthAdapterConfig | None = None
    facebook: OAuthAdapterConfig | None = None
