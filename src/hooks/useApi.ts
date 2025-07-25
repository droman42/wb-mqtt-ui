import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type {
  DeviceAction,
  MQTTMessage,
  SwitchScenarioRequest,
  ActionRequest,
  SystemInfo,
  SystemConfig,
  ReloadResponse,
  RoomDefinitionResponse,
  ScenarioDefinition,
  ScenarioState,
  ScenarioResponse,
  ScenarioVirtualConfigResponse,
  ScenarioVirtualConfigsResponse,
  Group,
  GroupedActionsResponse,
  GroupActionsResponse,
  CommandResponse,
  DeviceState,
  MQTTPublishResponse,
  PersistedStatesResponse,
} from '../types/api';
import { BaseDeviceState } from '../types/BaseDeviceState';

// Create axios instance with base configuration
// Use relative URLs when VITE_API_BASE_URL is empty (for nginx proxy)
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL;
  if (envURL === undefined || envURL === null) {
    return 'http://localhost:8000'; // Development fallback
  }
  return envURL === '' ? '/api' : envURL; // Empty string means use nginx proxy
};

const api = axios.create({
  baseURL: getBaseURL(),
  // No timeout - let backend manage operation-specific timeouts
});

// System hooks
export const useSystemInfo = () => {
  return useQuery({
    queryKey: ['system', 'info'],
    queryFn: () => api.get<SystemInfo>('/system').then(res => res.data),
  });
};

export const useSystemConfig = () => {
  return useQuery({
    queryKey: ['system', 'config'],
    queryFn: () => api.get<SystemConfig>('/config/system').then(res => res.data),
  });
};

export const useReloadSystem = () => {
  return useMutation({
    mutationFn: () => api.post<ReloadResponse>('/reload').then(res => res.data),
  });
};

// Device hooks
export const useDeviceConfig = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'config'],
    queryFn: () => api.get<any>(`/config/device/${deviceId}`).then(res => res.data),
    enabled: !!deviceId,
  });
};

export const useAllDeviceConfigs = () => {
  return useQuery({
    queryKey: ['devices', 'configs'],
    queryFn: () => api.get<any>('/config/devices').then(res => res.data),
  });
};

export const useDeviceState = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'state'],
    queryFn: () => api.get<BaseDeviceState>(`/devices/${deviceId}/state`).then(res => res.data),
    enabled: !!deviceId,
    // No more aggressive polling - only fetch on mount and after actions
  });
};

export const useDevicePersistedState = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'persisted'],
    queryFn: () => api.get<DeviceState>(`/devices/${deviceId}/persisted_state`).then(res => res.data),
    enabled: !!deviceId,
  });
};

export const useAllPersistedStates = () => {
  return useQuery({
    queryKey: ['devices', 'persisted'],
    queryFn: () => api.get<PersistedStatesResponse>('/devices/persisted_states').then(res => res.data),
  });
};

export const useExecuteDeviceAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, action }: { deviceId: string; action: DeviceAction }) =>
      api.post<CommandResponse>(`/devices/${deviceId}/action`, action).then(res => res.data),
    onSuccess: (response, { deviceId, action }) => {
      // If the response includes updated state, immediately update the cache
      if (response.state) {
        // Update the device state cache with the response data
        queryClient.setQueryData(['devices', deviceId, 'state'], response.state);
        
        // Also add last_command info to the state if not already present
        if (!response.state.last_command) {
          const updatedState = {
            ...response.state,
            last_command: {
              action: action.action,
              source: 'frontend',
              timestamp: new Date().toISOString(),
              params: action.params || null,
            },
          };
          queryClient.setQueryData(['devices', deviceId, 'state'], updatedState);
        }
      } else {
        // Fallback: invalidate to trigger refetch if no state in response
        queryClient.invalidateQueries({ queryKey: ['devices', deviceId, 'state'] });
      }
    },
  });
};

// Single-poll methods for explicit state checking
export const usePollDeviceState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => 
      api.get<BaseDeviceState>(`/devices/${deviceId}/state`).then(res => res.data),
    onSuccess: (data, deviceId) => {
      // Update the query cache with fresh data
      queryClient.setQueryData(['devices', deviceId, 'state'], data);
    },
  });
};

// Room hooks
export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<RoomDefinitionResponse[]>('/room/list').then(res => res.data),
  });
};

export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => api.get<RoomDefinitionResponse>(`/room/${roomId}`).then(res => res.data),
    enabled: !!roomId,
  });
};

// Scenario hooks
export const useScenarios = (roomId?: string) => {
  return useQuery({
    queryKey: ['scenarios', roomId],
    queryFn: () => {
      const params = roomId ? { room: roomId } : {};
      return api.get<ScenarioDefinition[]>('/scenario/definition', { params }).then(res => res.data);
    },
  });
};

export const useScenarioDefinition = (scenarioId: string) => {
  return useQuery({
    queryKey: ['scenarios', 'definition', scenarioId],
    queryFn: () => api.get<ScenarioDefinition>(`/scenario/definition/${scenarioId}`).then(res => res.data),
    enabled: !!scenarioId,
  });
};

export const useScenarioState = () => {
  return useQuery({
    queryKey: ['scenario', 'state'],
    queryFn: () => api.get<ScenarioState>('/scenario/state').then(res => res.data),
  });
};

export const useSwitchScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SwitchScenarioRequest) =>
      api.post<ScenarioResponse>('/scenario/switch', request).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario', 'state'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useExecuteRoleAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ActionRequest) =>
      api.post<ScenarioResponse>('/scenario/role_action', request).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario', 'state'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// Scenario start/shutdown hooks
export const useStartScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scenarioId: string) =>
      api.post<ScenarioResponse>('/scenario/start', { id: scenarioId }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario', 'state'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useShutdownScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scenarioId, graceful = true }: { scenarioId: string; graceful?: boolean }) =>
      api.post<ScenarioResponse>('/scenario/shutdown', { id: scenarioId, graceful }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenario', 'state'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

// Phase 2: Scenario Virtual Device Configuration hooks
export const useScenarioVirtualConfig = (scenarioId: string) => {
  return useQuery({
    queryKey: ['scenarios', 'virtual-config', scenarioId],
    queryFn: () => api.get<ScenarioVirtualConfigResponse>(`/scenario/virtual_config/${scenarioId}`).then(res => res.data),
    enabled: !!scenarioId,
  });
};

export const useScenarioVirtualConfigs = () => {
  return useQuery({
    queryKey: ['scenarios', 'virtual-configs'],
    queryFn: () => api.get<ScenarioVirtualConfigsResponse>('/scenario/virtual_configs').then(res => res.data),
  });
};

export const useScenarioWBConfig = (scenarioId: string) => {
  return useQuery({
    queryKey: ['scenarios', 'wb-config', scenarioId],
    queryFn: () => 
      api.get<ScenarioVirtualConfigResponse>(`/scenario/virtual_config/${scenarioId}`)
        .then(res => res.data.config),
    enabled: !!scenarioId,
  });
};

// Group hooks
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get<Group[]>('/groups').then(res => res.data),
  });
};

export const useDeviceGroups = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'groups'],
    queryFn: () => api.get<GroupedActionsResponse>(`/devices/${deviceId}/groups`).then(res => res.data),
    enabled: !!deviceId,
  });
};

export const useGroupActions = (deviceId: string, groupId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'groups', groupId, 'actions'],
    queryFn: () => api.get<GroupActionsResponse>(`/devices/${deviceId}/groups/${groupId}/actions`).then(res => res.data),
    enabled: !!(deviceId && groupId),
  });
};

// MQTT hooks
export const usePublishMQTT = () => {
  return useMutation({
    mutationFn: (message: MQTTMessage) =>
      api.post<MQTTPublishResponse>('/publish', message).then(res => res.data),
  });
};

// Query key helpers for consistent caching
export const queryKeys = {
  system: {
    info: ['system', 'info'] as const,
    config: ['system', 'config'] as const,
  },
  devices: {
    all: ['devices'] as const,
    configs: ['devices', 'configs'] as const,
    config: (deviceId: string) => ['devices', deviceId, 'config'] as const,
    state: (deviceId: string) => ['devices', deviceId, 'state'] as const,
    persistedState: (deviceId: string) => ['devices', deviceId, 'persisted'] as const,
    persistedStates: ['devices', 'persisted'] as const,
    groups: (deviceId: string) => ['devices', deviceId, 'groups'] as const,
    groupActions: (deviceId: string, groupId: string) => ['devices', deviceId, 'groups', groupId, 'actions'] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    detail: (roomId: string) => ['rooms', roomId] as const,
  },
  scenarios: {
    all: (roomId?: string) => ['scenarios', roomId] as const,
    detail: (scenarioId: string) => ['scenarios', 'definition', scenarioId] as const,
    state: ['scenario', 'state'] as const,
    virtualConfig: (scenarioId: string) => ['scenarios', 'virtual-config', scenarioId] as const,
    virtualConfigs: ['scenarios', 'virtual-configs'] as const,
    wbConfig: (scenarioId: string) => ['scenarios', 'wb-config', scenarioId] as const,
  },
  groups: {
    all: ['groups'] as const,
  },
}; 