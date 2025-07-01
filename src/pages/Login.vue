<script setup>
  import { ref } from 'vue'
  import { useRouter } from "vue-router";

  import { ElNotification } from 'element-plus'
  import api from '@/api/api.js'
  import { useUserStore } from '@/stores/user/store.js'

  const router = useRouter();
  const { loginUser, registrationUser } = api;
  const userStore = useUserStore();


  const isLogin = ref(true);
  const name = ref('');
  const email = ref('');
  const password = ref('');

  const setModalType = () => {
    isLogin.value = isLogin.value !== true;
    name.value = '';
    email.value = '';
    password.value = '';
  }

  const loginClick = async () => {
    try {
      const response = await loginUser(email.value, password.value);
      if (response) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('idUser', response.id);
        localStorage.setItem('userRole', response.userRole);

        location.replace('/');
      }
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }

  const registrationClick = async () => {
    try {
      const data = {
        name: name.value,
        email: email.value,
        password: password.value
      }
      const response = await registrationUser(data);
      if (response) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('idUser', response.id);

        await router.push('/');
        location.reload();
      }
    }
    catch (e) {
      console.error('Ошибка при выполнении запроса:', e);
      ElNotification({
        message: e.response.data.message,
        type: 'error',
      });
    }
  }
</script>

<template>
  <div class="register_modal">
    <el-form :label-width="auto" style="max-width: 600px" v-if="isLogin">
      <el-form-item
          label="Электронная почта"
          label-position="top"
      >
        <el-input v-model="email" />
      </el-form-item>
      <el-form-item
          label="Пароль"
          label-position="top"
      >
        <el-input type="password" v-model="password"/>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 250px" @click="loginClick" v-if="email !== '' && password !== ''">Войти</el-button>
        <el-button style="width: 250px" @click="loginClick" v-else disabled="disabled">Войти</el-button>
      </el-form-item>
    </el-form>

    <el-form :label-width="auto" style="max-width: 600px" v-else>
      <el-form-item
          label="Имя пользователя"
          label-position="top"
          required="required"
      >
        <el-input v-model="name" maxlength="20" />
      </el-form-item>
      <el-form-item
          label="Электронная почта"
          label-position="top"
          required="required"
      >
        <el-input v-model="email" />
      </el-form-item>
      <el-form-item
          label="Создайте пароль"
          label-position="top"
          required="required"
      >
        <el-input type="password" v-model="password"/>
      </el-form-item>
      <el-form-item>
        <el-button style="width: 250px" @click="registrationClick" v-if="email !== '' && password !== '' && name !==''">Зарегистрироваться</el-button>
        <el-button style="width: 250px" @click="registrationClick" v-else disabled="disabled">Зарегистрироваться</el-button>
      </el-form-item>
    </el-form>
    <p class="registration_select" v-if="isLogin" @click="setModalType">Зарегистрироваться</p>
    <p class="registration_select" v-else @click="setModalType">Войти в свой аккаунт</p>
  </div>
</template>

<style scoped>
  .register_modal {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 180px;
  }
  .registration_select {
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
  }
  .el-form-item {
    font-size: 24px;
    transition: color 0.3s ease;
  }
</style>
