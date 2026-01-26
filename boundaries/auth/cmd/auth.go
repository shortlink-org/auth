/*
Shortlink application

Auth-service
*/
package main

import (
	"log/slog"
	"os"

	"github.com/spf13/viper"

	"github.com/shortlink-org/go-sdk/graceful_shutdown"

	auth_di "github.com/shortlink-org/auth/auth/internal/di"
)

func main() {
	viper.SetDefault("SERVICE_NAME", "shortlink-auth")

	// Init a new service
	service, cleanup, err := auth_di.InitializeAuthService()
	if err != nil { // TODO: use as helpers
		panic(err)
	}

	defer func() {
		if r := recover(); r != nil {
			service.Log.Error(r.(string)) //nolint:forcetypeassert // simple type assertion
		}
	}()

	// Handle SIGINT, SIGQUIT and SIGTERM.
	signal := graceful_shutdown.GracefulShutdown()

	cleanup()

	service.Log.Info("Service stopped", slog.String("signal", signal.String()))

	// Exit Code 143: Graceful Termination (SIGTERM)
	os.Exit(143) //nolint:gocritic // exit code 143 is used to indicate graceful termination
}
