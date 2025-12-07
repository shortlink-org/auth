# Gateway API HTTPRoute Migration Guide

This guide explains how to migrate from traditional Kubernetes Ingress resources to the Kubernetes Gateway API HTTPRoute.

## Overview

The Kubernetes Gateway API is the next-generation API for configuring ingress in Kubernetes. It provides:
- **Better structure**: Clear separation between infrastructure (Gateway) and routing (HTTPRoute)
- **Enhanced capabilities**: Advanced routing features like URL rewriting, header manipulation, traffic splitting
- **Broader support**: Works with multiple ingress controllers (Istio, nginx-gateway, Cilium, etc.)
- **Improved role-based access control**: Different teams can manage Gateways and Routes independently

## What Changed

Both `auth` and `auth-ui` Helm charts now support HTTPRoute as an alternative to traditional Ingress:

### auth-ui Chart
- **Before**: Uses traditional Ingress with nginx IngressClass
- **After**: Can use HTTPRoute with nginx-gateway or other Gateway API implementations

### auth Chart
- **Before**: Uses Istio VirtualService
- **After**: Can use HTTPRoute with Istio Gateway (Istio natively supports Gateway API)

## Migration Steps

### For auth-ui (nginx → nginx-gateway)

1. **Ensure nginx-gateway is installed** in your cluster:
   ```bash
   kubectl get gatewayclass
   ```

2. **Create a Gateway resource** (if not already exists):
   ```yaml
   apiVersion: gateway.networking.k8s.io/v1
   kind: Gateway
   metadata:
     name: nginx-gateway
     namespace: nginx-gateway
   spec:
     gatewayClassName: nginx
     listeners:
       - name: http
         protocol: HTTP
         port: 80
       - name: https
         protocol: HTTPS
         port: 443
         tls:
           mode: Terminate
           certificateRefs:
             - name: landing-tls
   ```

3. **Update auth-ui values.yaml**:
   ```yaml
   # Disable traditional Ingress
   ingress:
     enabled: false
   
   # Enable HTTPRoute
   httpRoute:
     enabled: true
     parentRefs:
       - name: nginx-gateway
         namespace: nginx-gateway
     hostnames:
       - shortlink.best
     rules:
       - matches:
           - path:
               type: PathPrefix
               value: /auth
         filters:
           - type: URLRewrite
             urlRewrite:
               path:
                 type: ReplacePrefixMatch
                 replacePrefixMatch: /
         backendRefs:
           - name: shortlink-auth-ui
             port: 8080
   ```

### For auth (Istio VirtualService → Istio Gateway API)

1. **Verify Istio Gateway API support**:
   ```bash
   kubectl get crd gateways.gateway.networking.k8s.io
   ```

2. **Ensure Istio Gateway exists**:
   ```yaml
   apiVersion: gateway.networking.k8s.io/v1
   kind: Gateway
   metadata:
     name: istio-gateway
     namespace: istio-system
   spec:
     gatewayClassName: istio
     listeners:
       - name: grpc
         protocol: HTTP
         port: 50051
   ```

3. **Update auth values.yaml**:
   ```yaml
   # Disable Istio VirtualService
   ingress:
     enabled: false
   
   # Enable HTTPRoute
   httpRoute:
     enabled: true
     parentRefs:
       - name: istio-gateway
         namespace: istio-system
     rules:
       - matches:
           - path:
               type: PathPrefix
               value: /authzed.api.v1.SchemaService/
         backendRefs:
           - name: shortlink
             port: 50051
       # ... additional routes for other services
   ```

## Rollback Plan

If you need to rollback to traditional Ingress:

1. Set `httpRoute.enabled: false`
2. Set `ingress.enabled: true`
3. Apply the Helm chart

## Testing the Migration

After migrating, verify:

1. **Routes are working**:
   ```bash
   # For auth-ui
   curl https://shortlink.best/auth
   
   # For auth (gRPC)
   grpcurl -plaintext shortlink.best:50051 authzed.api.v1.SchemaService/ReadSchema
   ```

2. **Check HTTPRoute status**:
   ```bash
   kubectl get httproute -n <namespace>
   kubectl describe httproute <route-name> -n <namespace>
   ```

3. **Verify Gateway status**:
   ```bash
   kubectl get gateway -A
   kubectl describe gateway <gateway-name> -n <namespace>
   ```

## Benefits of Migration

- **Future-proof**: Gateway API is the recommended standard for Kubernetes ingress
- **Vendor-neutral**: Works across different ingress controllers
- **Advanced features**: URL rewriting, traffic splitting, header manipulation
- **Better observability**: Clearer status reporting and conditions
- **Separation of concerns**: Infrastructure teams manage Gateways, app teams manage Routes

## Resources

- [Kubernetes Gateway API Documentation](https://gateway-api.sigs.k8s.io/)
- [Istio Gateway API Guide](https://istio.io/latest/docs/tasks/traffic-management/ingress/gateway-api/)
- [NGINX Gateway Fabric](https://github.com/nginxinc/nginx-gateway-fabric)

## Support

For issues or questions about the migration, please open an issue in the repository.
