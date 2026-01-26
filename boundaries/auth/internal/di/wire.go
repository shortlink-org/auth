//go:generate go tool wire
//go:build wireinject

// The build tag makes sure the stub is not built in the final build.

/*
Auth Service DI-package
*/
package auth_di

import (
	"github.com/authzed/authzed-go/v1"
	"github.com/google/wire"
	shortctx "github.com/shortlink-org/go-sdk/context"
	"github.com/shortlink-org/go-sdk/flags"
	"github.com/shortlink-org/go-sdk/flight_trace"
	"github.com/shortlink-org/go-sdk/logger"
	"github.com/shortlink-org/go-sdk/observability/tracing"
	"go.opentelemetry.io/otel/metric"
	api "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/trace"

	"github.com/shortlink-org/go-sdk/auth/permission"
	"github.com/shortlink-org/go-sdk/config"
	"github.com/shortlink-org/go-sdk/observability/metrics"
	"github.com/shortlink-org/go-sdk/observability/profiling"

	permission_service "github.com/shortlink-org/auth/auth/internal/services/permission"
)

type AuthService struct {
	// Common
	Log    logger.Logger
	Config *config.Config

	// Observability
	Tracer        trace.TracerProvider
	Metrics       *metrics.Monitoring
	PprofEndpoint profiling.PprofEndpoint
	FlightTrace   *flight_trace.Recorder

	// Security
	authPermission *authzed.Client

	// Application
	permissionService *permission_service.Service
}

// DefaultSet ==========================================================================================================
var DefaultSet = wire.NewSet(
	shortctx.New,
	flags.New,
	config.New,
	logger.NewDefault,
	tracing.New,
	metrics.New,
	profiling.New,
	flight_trace.New,
)

// AuthService =========================================================================================================
var AuthSet = wire.NewSet(
	// Common
	DefaultSet,
	permission.New,
	wire.FieldsOf(new(*metrics.Monitoring), "Prometheus", "Metrics"),
	wire.Bind(new(metric.MeterProvider), new(*api.MeterProvider)),

	// Application
	permission_service.New,

	NewAuthService,
)

func NewAuthService(
	// Common
	log logger.Logger,
	config *config.Config,

	// Observability
	metrics *metrics.Monitoring,
	tracer trace.TracerProvider,
	pprofHTTP profiling.PprofEndpoint,
	flightTrace *flight_trace.Recorder,

	// Security
	authPermission *authzed.Client,

	// Application
	permissionService *permission_service.Service,
) (*AuthService, error) {
	return &AuthService{
		// Common
		Log:    log,
		Config: config,

		// Observability
		Tracer:        tracer,
		Metrics:       metrics,
		PprofEndpoint: pprofHTTP,
		FlightTrace:   flightTrace,

		// Security
		authPermission: authPermission,

		// Application
		permissionService: permissionService,
	}, nil
}

func InitializeAuthService() (*AuthService, func(), error) {
	panic(wire.Build(AuthSet))
}
