SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

# INCLUDE ==============================================================================================================
# Include Makefile
include $(SELF_DIR)/ops/Makefile/common.mk
include $(SELF_DIR)/ops/Makefile/k8s/k8s.mk
