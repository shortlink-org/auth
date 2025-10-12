package permission_client

import (
	"context"

	"github.com/authzed/authzed-go/v1"
	"github.com/shortlink-org/go-sdk/logger"
	"go.opentelemetry.io/otel/trace"

	"github.com/shortlink-org/go-sdk/auth"
	rpc "github.com/shortlink-org/go-sdk/grpc"
	error_di "github.com/shortlink-org/shortlink/pkg/di/pkg/error"
	"github.com/shortlink-org/shortlink/pkg/observability/metrics"
)

func New(_ context.Context, log logger.Logger, tracer trace.TracerProvider, monitor *metrics.Monitoring) (*authzed.Client, error) {
	// Initialize gRPC Client's interceptor.
	opts := []rpc.Option{
		rpc.WithMetrics(monitor.Prometheus),
		rpc.WithTracer(tracer, monitor.Prometheus, monitor.Metrics),
		rpc.WithTimeout(),
		rpc.WithLogger(log),
	}

	permission, err := auth.New(opts...)
	if err != nil {
		return nil, &error_di.BaseError{Err: err}
	}

	return permission, nil
}
