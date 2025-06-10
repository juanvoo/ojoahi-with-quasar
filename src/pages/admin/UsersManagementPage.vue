<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="text-h5 q-mb-md">Gestión de Usuarios</div>
            <p class="text-subtitle1 text-grey-7">
              Administra todos los usuarios de la plataforma.
            </p>
          </q-card>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="people" size="2rem" color="primary" />
            <div class="text-h6 q-mt-sm">{{ stats.total }}</div>
            <div class="text-caption">Total Usuarios</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="visibility" size="2rem" color="blue" />
            <div class="text-h6 q-mt-sm">{{ stats.blind }}</div>
            <div class="text-caption">Usuarios Ciegos</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="volunteer_activism" size="2rem" color="green" />
            <div class="text-h6 q-mt-sm">{{ stats.volunteers }}</div>
            <div class="text-caption">Voluntarios</div>
          </q-card>
        </div>
        
        <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md">
            <q-icon name="online_prediction" size="2rem" color="orange" />
            <div class="text-h6 q-mt-sm">{{ stats.active }}</div>
            <div class="text-caption">Activos Hoy</div>
          </q-card>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filters.search"
                  label="Buscar usuarios"
                  outlined
                  dense
                  clearable
                  @input="filterUsers"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.role"
                  :options="roleOptions"
                  label="Filtrar por rol"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterUsers"
                />
              </div>
              
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  label="Estado"
                  outlined
                  dense
                  clearable
                  @update:model-value="filterUsers"
                />
              </div>
              
              <div class="col-12 col-md-2">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="Actualizar"
                  @click="loadUsers"
                  :loading="loading"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Tabla de Usuarios -->
        <div class="col-12">
          <q-card>
            <q-table
              :rows="filteredUsers"
              :columns="columns"
              row-key="id"
              :loading="loading"
              :pagination="pagination"
              @request="onRequest"
              binary-state-sort
            >
              <template v-slot:body-cell-avatar="props">
                <q-td :props="props">
                  <q-avatar size="40px">
                    <img :src="props.row.profile_image || defaultAvatar" :alt="props.row.username">
                  </q-avatar>
                </q-td>
              </template>

              <template v-slot:body-cell-role="props">
                <q-td :props="props">
                  <q-chip
                    :color="getRoleColor(props.row.role)"
                    text-color="white"
                    size="sm"
                  >
                    {{ getRoleLabel(props.row.role) }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="props.row.is_active ? 'green' : 'red'"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.row.is_active ? 'Activo' : 'Inactivo' }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <div class="q-gutter-sm">
                    <q-btn
                      flat
                      round
                      icon="visibility"
                      color="primary"
                      @click="viewUser(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      icon="edit"
                      color="warning"
                      @click="editUser(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      :icon="props.row.is_active ? 'block' : 'check_circle'"
                      :color="props.row.is_active ? 'negative' : 'positive'"
                      @click="toggleUserStatus(props.row)"
                    />
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog Ver Usuario -->
    <q-dialog v-model="viewDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalles del Usuario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <div class="row q-col-gutter-md">
            <div class="col-12 text-center">
              <q-avatar size="100px">
                <img :src="selectedUser.profile_image || defaultAvatar" :alt="selectedUser.username">
              </q-avatar>
            </div>
            
            <div class="col-12">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Nombre de usuario</q-item-label>
                    <q-item-label>{{ selectedUser.username }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Nombre completo</q-item-label>
                    <q-item-label>{{ selectedUser.name || 'No especificado' }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Email</q-item-label>
                    <q-item-label>{{ selectedUser.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Rol</q-item-label>
                    <q-item-label>
                      <q-chip :color="getRoleColor(selectedUser.role)" text-color="white">
                        {{ getRoleLabel(selectedUser.role) }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Fecha de registro</q-item-label>
                    <q-item-label>{{ formatDate(selectedUser.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="selectedUser.bio">
                  <q-item-section>
                    <q-item-label overline>Biografía</q-item-label>
                    <q-item-label>{{ selectedUser.bio }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { Notify, Dialog } from 'quasar'

export default defineComponent({
  name: 'UsersManagementPage',
  
  setup() {
    const loading = ref(true)
    const users = ref([])
    const filteredUsers = ref([])
    const viewDialog = ref(false)
    const selectedUser = ref(null)
    const defaultAvatar = 'https://cdn.quasar.dev/img/boy-avatar.png'
    
    const stats = ref({
      total: 0,
      blind: 0,
      volunteers: 0,
      active: 0
    })
    
    const filters = ref({
      search: '',
      role: null,
      status: null
    })
    
    const pagination = ref({
      sortBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })
    
    const roleOptions = [
      { label: 'Usuarios Ciegos', value: 'blind' },
      { label: 'Voluntarios', value: 'volunteer' },
      { label: 'Administradores', value: 'admin' }
    ]
    
    const statusOptions = [
      { label: 'Activos', value: true },
      { label: 'Inactivos', value: false }
    ]
    
    const columns = [
      {
        name: 'avatar',
        label: '',
        field: 'profile_image',
        align: 'center',
        sortable: false
      },
      {
        name: 'username',
        required: true,
        label: 'Usuario',
        align: 'left',
        field: 'username',
        sortable: true
      },
      {
        name: 'name',
        label: 'Nombre',
        field: 'name',
        sortable: true
      },
      {
        name: 'email',
        label: 'Email',
        field: 'email',
        sortable: true
      },
      {
        name: 'role',
        label: 'Rol',
        field: 'role',
        sortable: true
      },
      {
        name: 'status',
        label: 'Estado',
        field: 'is_active',
        sortable: true
      },
      {
        name: 'created_at',
        label: 'Registro',
        field: 'created_at',
        sortable: true,
        format: val => formatDate(val)
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'center',
        sortable: false
      }
    ]
    
    const loadUsers = async () => {
      try {
        loading.value = true
        
        // Simular datos mientras implementamos la API real
        const mockUsers = [
          {
            id: 1,
            username: 'juan_ciego',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            role: 'blind',
            is_active: true,
            created_at: '2024-01-15T10:30:00Z',
            profile_image: null,
            bio: 'Usuario ciego que necesita ayuda ocasional'
          },
          {
            id: 2,
            username: 'maria_voluntaria',
            name: 'María García',
            email: 'maria@example.com',
            role: 'volunteer',
            is_active: true,
            created_at: '2024-01-10T14:20:00Z',
            profile_image: null,
            bio: 'Voluntaria con experiencia en acompañamiento'
          },
          {
            id: 3,
            username: 'admin',
            name: 'Administrador',
            email: 'admin@ojoahi.com',
            role: 'admin',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            profile_image: null,
            bio: 'Administrador del sistema'
          }
        ]
        
        users.value = mockUsers
        filteredUsers.value = mockUsers
        
        // Calcular estadísticas
        stats.value = {
          total: mockUsers.length,
          blind: mockUsers.filter(u => u.role === 'blind').length,
          volunteers: mockUsers.filter(u => u.role === 'volunteer').length,
          active: mockUsers.filter(u => u.is_active).length
        }
        
      } catch (error) {
        console.error('Error loading users:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al cargar usuarios'
        })
      } finally {
        loading.value = false
      }
    }
    
    const filterUsers = () => {
      let filtered = users.value
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(user =>
          user.username.toLowerCase().includes(search) ||
          user.name?.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        )
      }
      
      if (filters.value.role) {
        filtered = filtered.filter(user => user.role === filters.value.role.value)
      }
      
      if (filters.value.status !== null) {
        filtered = filtered.filter(user => user.is_active === filters.value.status.value)
      }
      
      filteredUsers.value = filtered
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const getRoleColor = (role) => {
      const colors = {
        'blind': 'blue',
        'volunteer': 'green',
        'admin': 'purple'
      }
      return colors[role] || 'grey'
    }
    
    const getRoleLabel = (role) => {
      const labels = {
        'blind': 'Usuario Ciego',
        'volunteer': 'Voluntario',
        'admin': 'Administrador'
      }
      return labels[role] || role
    }
    
    const viewUser = (user) => {
      selectedUser.value = user
      viewDialog.value = true
    }
    
    const editUser = (user) => {
      // Implementar edición de usuario
      Notify.create({
        type: 'info',
        message: 'Función de edición en desarrollo'
      })
    }
    
    const toggleUserStatus = (user) => {
      const action = user.is_active ? 'desactivar' : 'activar'
      
      Dialog.create({
        title: `Confirmar ${action}`,
        message: `¿Estás seguro de que quieres ${action} a ${user.username}?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          // Simular cambio de estado
          user.is_active = !user.is_active
          
          Notify.create({
            type: 'positive',
            message: `Usuario ${action}do correctamente`
          })
        } catch (error) {
          console.error('Error toggling user status:', error)
          Notify.create({
            type: 'negative',
            message: 'Error al cambiar el estado del usuario'
          })
        }
      })
    }
    
    const onRequest = (props) => {
      // Implementar paginación del servidor si es necesario
      pagination.value = props.pagination
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    return {
      loading,
      filteredUsers,
      stats,
      filters,
      pagination,
      columns,
      roleOptions,
      statusOptions,
      viewDialog,
      selectedUser,
      defaultAvatar,
      loadUsers,
      filterUsers,
      formatDate,
      getRoleColor,
      getRoleLabel,
      viewUser,
      editUser,
      toggleUserStatus,
      onRequest
    }
  }
})
</script>
