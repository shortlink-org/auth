package permission

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"path/filepath"

	pb "github.com/authzed/authzed-go/proto/authzed/api/v1"
	"github.com/authzed/authzed-go/v1"
	"gopkg.in/yaml.v3"

	"github.com/shortlink-org/shortlink/pkg/logger"
)

//go:embed permissions/*
var permissions embed.FS

type Service struct {
	// Common
	log logger.Logger

	// Security
	permission *authzed.Client
}

func New(ctx context.Context, log logger.Logger, permissionClient *authzed.Client) (*Service, error) {
	svc := &Service{
		// Common
		log: log,

		// Security
		permission: permissionClient,
	}

	err := svc.Migrations(ctx, permissions)
	if err != nil {
		return nil, err
	}

	log.Info("Permission migrations completed")

	// Graceful shutdown
	go func() {
		<-ctx.Done()

		log.Info("Permission service shutdown")
	}()

	return svc, nil
}

// Migrations run the migrations for the authzed service.
func (s *Service) Migrations(ctx context.Context, fsys embed.FS) error {
	permissionsData, err := GetPermissions(fsys)
	if err != nil {
		return err
	}

	for i := range permissionsData {
		_, err = s.permission.SchemaServiceClient.WriteSchema(ctx, permissionsData[i])
		if err != nil {
			return fmt.Errorf("failed to write schema: %w", err)
		}
	}

	return nil
}

// GetPermissions returns a list of permissions from the embedded permissions directory.
func GetPermissions(fsys fs.FS) ([]*pb.WriteSchemaRequest, error) {
	var zedFileData [][]byte

	err := fs.WalkDir(fsys, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if !d.IsDir() && filepath.Ext(d.Name()) == ".yaml" {
			fileData, errReadFile := fs.ReadFile(fsys, path)
			if errReadFile != nil {
				return fmt.Errorf("failed to read file: %w", errReadFile)
			}

			zedFileData = append(zedFileData, fileData)
		}

		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	schemas, err := GetSchema(zedFileData)
	if err != nil {
		return nil, fmt.Errorf("failed to get schema: %w", err)
	}

	return schemas, nil
}

// GetSchema returns a list of schema from the embedded schema directory.
func GetSchema(files [][]byte) ([]*pb.WriteSchemaRequest, error) {
	schemaData := make([]*pb.WriteSchemaRequest, 0, len(files))

	for _, file := range files {
		schema := &pb.WriteSchemaRequest{}

		err := yaml.Unmarshal(file, schema)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal schema: %w", err)
		}

		schemaData = append(schemaData, schema)
	}

	return schemaData, nil
}
