package permission_client

import (
	"context"

	"github.com/authzed/authzed-go/v1"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/shortlink-org/go-sdk/logger"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"

	"github.com/shortlink-org/go-sdk/auth"
	rpc "github.com/shortlink-org/go-sdk/grpc"
)

func New(
	_ context.Context,
	log logger.Logger,
	tracer trace.TracerProvider,
	prometheusRegistry *prometheus.Registry,
	meter metric.Meter,
) (*authzed.Client, error) {
	// Initialize gRPC Client's interceptor.
	opts := []rpc.Option{
		rpc.WithMetrics(prometheusRegistry),
		rpc.WithTracer(tracer, prometheusRegistry, meter),
		rpc.WithTimeout(),
		rpc.WithLogger(log),
	}

	permission, err := auth.New(opts...)
	if err != nil {
		return nil, err
	}

	return permission, nil
}
