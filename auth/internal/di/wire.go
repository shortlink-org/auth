//go:generate go tool wire
//go:build wireinject

// The build tag makes sure the stub is not built in the final build.

/*
Auth Service DI-package
*/
package auth_di

import (
	"context"

	"github.com/authzed/authzed-go/v1"
	"github.com/google/wire"
	"github.com/prometheus/client_golang/prometheus"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"

	"github.com/shortlink-org/go-sdk/config"
	"github.com/shortlink-org/go-sdk/logger"

	permission_client "github.com/shortlink-org/auth/auth/internal/di/pkg/permission"
	"github.com/shortlink-org/auth/auth/internal/services/permission"
)

type AuthService struct {
	// Common
	Log    logger.Logger
	Config *config.Config

	// Observability
	Tracer     trace.TracerProvider
	Prometheus *prometheus.Registry
	Metrics    metric.Meter

	// Security
	authPermission *authzed.Client

	// Application
	permissionService *permission.Service
}

// AuthService =========================================================================================================
var AuthSet = wire.NewSet(
	// Context
	context.Background,

	// Config and Logger from go-sdk
	config.New,
	logger.New,

	// Observability - native components
	NewPrometheusRegistry,
	NewTracer,
	NewMeter,

	// Auth client
	permission_client.New,

	// Application
	permission.New,

	NewAuthService,
)

// NewPrometheusRegistry creates a new Prometheus registry
func NewPrometheusRegistry() *prometheus.Registry {
	return prometheus.NewRegistry()
}

// NewTracer creates a trace provider (stub for now, can be extended)
func NewTracer() trace.TracerProvider {
	return trace.NewNoopTracerProvider()
}

// NewMeter creates a meter (stub for now, can be extended)
func NewMeter() metric.Meter {
	return nil
}

func NewAuthService(
	// Common
	log logger.Logger,
	config *config.Config,

	// Observability
	prometheus *prometheus.Registry,
	tracer trace.TracerProvider,
	meter metric.Meter,

	// Security
	authPermission *authzed.Client,

	// Application
	permissionService *permission.Service,
) (*AuthService, error) {
	return &AuthService{
		// Common
		Log:    log,
		Config: config,

		// Observability
		Tracer:     tracer,
		Prometheus: prometheus,
		Metrics:    meter,

		// Jobs
		authPermission: authPermission,

		// Application
		permissionService: permissionService,
	}, nil
}

func InitializeAuthService() (*AuthService, func(), error) {
	panic(wire.Build(AuthSet))
}
