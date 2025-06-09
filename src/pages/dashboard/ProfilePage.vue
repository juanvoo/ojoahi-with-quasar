<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-lg">
            <h1 class="text-h4 q-mb-md">Mi Perfil</h1>
            <p class="text-subtitle1 text-grey-7">
              Gestiona tu información personal y configuración de cuenta.
            </p>
          </q-card>
        </div>
        
        <div class="col-12 col-md-8">
          <q-card class="q-pa-lg">
            <h2 class="text-h5 q-mb-md">Información Personal</h2>
            
            <q-form @submit="updateProfile" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="profile.username"
                    label="Nombre de usuario"
                    outlined
                    :rules="[val => !!val || 'El nombre de usuario es requerido']"
                  />
                </div>
                
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="profile.name"
                    label="Nombre completo"
                    outlined
                  />
                </div>
                
                <div class="col-12">
                  <q-input
                    v-model="profile.email"
                    label="Email"
                    type="email"
                    outlined
                    :rules="[val => !!val || 'El email es requerido']"
                  />
                </div>
                
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="profile.phone"
                    label="Teléfono"
                    outlined
                  />
                </div>
                
                <div class="col-12">
                  <q-input
                    v-model="profile.address"
                    label="Dirección"
                    outlined
                  />
                </div>
                
                <div class="col-12">
                  <q-input
                    v-model="profile.bio"
                    label="Biografía"
                    type="textarea"
                    rows="3"
                    outlined
                  />
                </div>
                
                <div class="col-12" v-if="isVolunteer">
                  <q-input
                    v-model="profile.availability"
                    label="Disponibilidad"
                    type="textarea"
                    rows="2"
                    outlined
                    hint="Describe cuándo estás disponible para ayudar"
                  />
                </div>
              </div>
              
              <div class="q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Actualizar Perfil"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card>
        </div>
        
        <div class="col-12 col-md-4">
          <q-card class="q-pa-lg text-center">
            <h2 class="text-h6 q-mb-md">Foto de Perfil</h2>
            
            <q-avatar size="120px" class="q-mb-md">
              <img :src="userAvatar" alt="Avatar">
            </q-avatar>
            
            <q-btn
              color="secondary"
              label="Cambiar Foto"
              outline
              class="full-width q-mb-md"
              @click="openPhotoDialog"
            />
            
            <div class="text-caption text-grey-6">
              Formatos permitidos: JPG, PNG<br>
              Tamaño máximo: 2MB
            </div>
          </q-card>
          
          <q-card class="q-pa-lg q-mt-md">
            <h2 class="text-h6 q-mb-md">Cambiar Contraseña</h2>
            
            <q-form @submit="changePassword" class="q-gutter-md">
              <q-input
                v-model="passwordForm.current"
                label="Contraseña actual"
                type="password"
                outlined
                :rules="[val => !!val || 'La contraseña actual es requerida']"
              />
              
              <q-input
                v-model="passwordForm.new"
                label="Nueva contraseña"
                type="password"
                outlined
                :rules="[val => !!val || 'La nueva contraseña es requerida']"
              />
              
              <q-input
                v-model="passwordForm.confirm"
                label="Confirmar contraseña"
                type="password"
                outlined
                :rules="[
                  val => !!val || 'Confirma la nueva contraseña',
                  val => val === passwordForm.new || 'Las contraseñas no coinciden'
                ]"
              />
              
              <q-btn
                type="submit"
                color="warning"
                label="Cambiar Contraseña"
                class="full-width"
                :loading="passwordLoading"
              />
            </q-form>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog para cambiar foto -->
    <q-dialog v-model="photoDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Cambiar foto de perfil</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <q-tabs
              v-model="photoTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="upload" label="Subir foto" />
              <q-tab name="avatar" label="Avatar predefinido" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="photoTab" animated>
              <q-tab-panel name="upload">
                <div class="text-center q-pa-md">
                  <q-uploader
                    ref="uploader"
                    label="Arrastra una imagen o haz clic para seleccionar"
                    accept=".jpg, .jpeg, .png"
                    :max-file-size="2097152"
                    :max-files="1"
                    flat
                    bordered
                    @rejected="onRejected"
                    @added="onFileAdded"
                    style="max-width: 100%"
                  />
                </div>
                <div v-if="selectedFile" class="text-center q-mt-md">
                  <q-img
                    :src="previewUrl"
                    style="height: 150px; max-width: 100%"
                    fit="contain"
                  />
                </div>
              </q-tab-panel>

              <q-tab-panel name="avatar">
                <div class="row q-col-gutter-sm justify-center">
                  <div v-for="(avatar, index) in avatars" :key="index" class="col-4 col-sm-3">
                    <q-img
                      :src="avatar"
                      class="cursor-pointer avatar-option"
                      :class="{ 'avatar-selected': selectedAvatar === avatar }"
                      style="height: 80px; width: 80px; border-radius: 50%"
                      @click="selectAvatar(avatar)"
                    />
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn 
            flat 
            label="Guardar" 
            color="primary" 
            @click="saveProfilePhoto" 
            :disable="!canSave"
            :loading="savingPhoto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { Notify } from 'quasar'

export default defineComponent({
  name: 'ProfilePage',
  
  setup() {
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const passwordLoading = ref(false)
    const photoDialog = ref(false)
    const photoTab = ref('upload')
    const selectedFile = ref(null)
    const previewUrl = ref('')
    const selectedAvatar = ref('')
    const savingPhoto = ref(false)
    
    const profile = ref({
      username: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      bio: '',
      availability: ''
    })
    
    const passwordForm = ref({
      current: '',
      new: '',
      confirm: ''
    })
    
    // Lista de avatares predefinidos
    const avatars = [
      'https://cdn.quasar.dev/img/boy-avatar.png',
      'https://cdn.quasar.dev/img/avatar1.jpg',
      'https://cdn.quasar.dev/img/avatar2.jpg',
      'https://cdn.quasar.dev/img/avatar3.jpg',
      'https://cdn.quasar.dev/img/avatar4.jpg',
      'https://cdn.quasar.dev/img/avatar5.jpg',
      'https://cdn.quasar.dev/img/avatar6.jpg',
    ]
    
    const isVolunteer = computed(() => authStore.isVolunteer)
    
    const userAvatar = computed(() => {
      if (authStore.user?.profile_image) {
        return authStore.user.profile_image
      }
      return 'https://cdn.quasar.dev/img/boy-avatar.png'
    })
    
    const canSave = computed(() => {
      return (photoTab.value === 'upload' && selectedFile.value) || 
             (photoTab.value === 'avatar' && selectedAvatar.value)
    })
    
    const updateProfile = async () => {
      loading.value = true
      
      try {
        const success = await authStore.updateProfile(profile.value)
        
        if (success) {
          Notify.create({
            type: 'positive',
            message: 'Perfil actualizado correctamente'
          })
        }
      } catch (error) {
        console.error('Error updating profile:', error)
      } finally {
        loading.value = false
      }
    }
    
    const changePassword = async () => {
      passwordLoading.value = true
      
      try {
        const success = await authStore.changePassword({
          current_password: passwordForm.value.current,
          new_password: passwordForm.value.new,
          confirm_password: passwordForm.value.confirm
        })
        
        if (success) {
          // Clear form
          passwordForm.value = {
            current: '',
            new: '',
            confirm: ''
          }
        }
      } catch (error) {
        console.error('Error changing password:', error)
      } finally {
        passwordLoading.value = false
      }
    }
    
    const openPhotoDialog = () => {
      photoDialog.value = true
      photoTab.value = 'upload'
      selectedFile.value = null
      previewUrl.value = ''
      selectedAvatar.value = ''
    }
    
    const onFileAdded = (files) => {
      if (files && files.length > 0) {
        selectedFile.value = files[0]
        
        // Crear URL para previsualización
        if (previewUrl.value) {
          URL.revokeObjectURL(previewUrl.value)
        }
        previewUrl.value = URL.createObjectURL(selectedFile.value)
      }
    }
    
    const onRejected = (rejectedEntries) => {
      rejectedEntries.forEach(entry => {
        let msg = ''
        if (entry.failedPropValidation === 'accept') {
          msg = 'El archivo debe ser una imagen (JPG o PNG)'
        } else if (entry.failedPropValidation === 'max-file-size') {
          msg = 'El archivo es demasiado grande (máximo 2MB)'
        } else {
          msg = 'Error al subir el archivo'
        }
        
        Notify.create({
          type: 'negative',
          message: msg
        })
      })
    }
    
    const selectAvatar = (avatar) => {
      selectedAvatar.value = avatar
    }
    
    const saveProfilePhoto = async () => {
      savingPhoto.value = true
      
      try {
        let photoUrl = ''
        
        if (photoTab.value === 'upload' && selectedFile.value) {
          // En un caso real, aquí subiríamos el archivo al servidor
          // Por ahora, simularemos que se ha subido correctamente
          photoUrl = previewUrl.value
        } else if (photoTab.value === 'avatar' && selectedAvatar.value) {
          photoUrl = selectedAvatar.value
        }
        
        if (photoUrl) {
          // Actualizar el perfil con la nueva foto
          await authStore.updateProfile({
            ...profile.value,
            profile_image: photoUrl
          })
          
          Notify.create({
            type: 'positive',
            message: 'Foto de perfil actualizada correctamente'
          })
          
          photoDialog.value = false
        }
      } catch (error) {
        console.error('Error saving profile photo:', error)
        
        Notify.create({
          type: 'negative',
          message: 'Error al guardar la foto de perfil'
        })
      } finally {
        savingPhoto.value = false
      }
    }
    
    onMounted(() => {
      // Load current user data
      if (authStore.user) {
        profile.value = {
          username: authStore.user.username || '',
          name: authStore.user.name || '',
          email: authStore.user.email || '',
          phone: authStore.user.phone || '',
          address: authStore.user.address || '',
          bio: authStore.user.bio || '',
          availability: authStore.user.availability || ''
        }
      }
    })
    
    return {
      profile,
      passwordForm,
      loading,
      passwordLoading,
      isVolunteer,
      userAvatar,
      updateProfile,
      changePassword,
      photoDialog,
      photoTab,
      selectedFile,
      previewUrl,
      selectedAvatar,
      avatars,
      canSave,
      savingPhoto,
      openPhotoDialog,
      onFileAdded,
      onRejected,
      selectAvatar,
      saveProfilePhoto
    }
  }
})
</script>

<style scoped>
.avatar-option {
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-selected {
  border: 2px solid var(--q-primary);
}
</style>
