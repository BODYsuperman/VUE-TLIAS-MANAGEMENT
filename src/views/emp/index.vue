<script setup>
import { ref, watch, onMounted } from 'vue';
import {
  queryPageApi,
  addApi,
  queryByIdApi,
  updateApi,
  deleteApi,
} from '@/api/emp';
import { ElMessage, ElMessageBox } from 'element-plus';

import { queryAllApi as getDepts } from '@/api/dept';

const token = ref('');
//Job list data
const jobs = ref([
  { name: 'Class Teacher', value: 1 },
  { name: 'Instructor', value: 2 },
  { name: 'Student Affairs Director', value: 3 },
  { name: 'Teaching Research Director', value: 4 },
  { name: 'Counselor', value: 5 },
  { name: 'Other', value: 6 },
]);

// Gender list data
const genders = ref([
  { name: 'Male', value: 1 },
  { name: 'Female', value: 2 },
]);

const depts = ref([]);
const searchEmp = ref({
  name: '',
  gender: '',
  date: [],
  begin: '',
  end: '',
});

watch(
  () => searchEmp.value.date,
  (newVal) => {
    if (newVal && newVal.length === 2) {
      searchEmp.value.begin = newVal[0];
      searchEmp.value.end = newVal[1];
    } else {
      searchEmp.value.begin = '';
      searchEmp.value.end = '';
    }
  }
);

const search = async () => {
  const result = await queryPageApi(
    searchEmp.value.name,
    searchEmp.value.gender,
    searchEmp.value.begin,
    searchEmp.value.end,
    currentPage.value,
    pageSize.value
  );

  if (result.code === 1) {
    empList.value = result.data.rows;
    total.value = result.data.total;
  }
};

const clear = () => {
  searchEmp.value = {
    name: '',
    gender: '',
    date: [],
    begin: '',
    end: '',
  };
  search();
};

const empList = ref([]);

const currentPage = ref(1);

const pageSize = ref(10);

const background = ref(true);
const total = ref(0);

const handleSizeChange = (val) => {
  search();
};
const handleCurrentChange = (val) => {
  search();
};

onMounted(() => {
  search();
  getDeptList();
  getToken();
});

const getToken = () => {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (loginUser && loginUser.token) {
    token.value = loginUser.token;
  }
};

const getDeptList = async () => {
  const result = await getDepts();

  if (result.code === 1) {
    depts.value = result.data;
  }
};

const employee = ref({
  username: '',
  name: '',
  gender: '',
  phone: '',
  job: '',
  salary: '',
  deptId: '',
  entryDate: '',
  image: '',
  exprList: [],
});

// 控制弹窗
const dialogVisible = ref(false);
const dialogTitle = ref('新增员工');

//文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response) => {
  console.log('上传返回:', response); // 先看看返回结构

  // 根据后端返回结构获取URL
  if (response.code === 1 && response.data) {
    // 方案A：如果返回的是对象 { fileName, url }
    if (response.data.url) {
      employee.value.image = response.data.url;
    }
    // 方案B：如果返回的是字符串URL
    else if (typeof response.data === 'string') {
      // 如果是相对路径，拼接完整地址
      if (response.data.startsWith('http')) {
        employee.value.image = response.data;
      } else {
        employee.value.image = 'http://localhost:8080' + response.data;
      }
    }
  }
};
// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Only JPG/PNG files are allowed');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('Only images smaller than 10MB are allowed');
    return false;
  }
  return true;
};

const addEmp = () => {
  dialogVisible.value = true;
  dialogTitle.value = '新增员工';
  employee.value = {
    username: '',
    name: '',
    gender: '',
    phone: '',
    job: '',
    salary: '',
    deptId: '',
    entryDate: '',
    image: '',
    exprList: [],
  };

  if (empFormRef.value) {
    empFormRef.value.resetFields();
  }
};

const addExpr = () => {
  employee.value.exprList.push({
    company: '',
    job: '',
    begin: '',
    end: '',
    exprDate: [],
  });
};

const removeExpr = (index) => {
  employee.value.exprList.splice(index, 1);
};

watch(
  () => employee.value.exprList,
  (newVal) => {
    newVal.forEach((expr) => {
      if (expr.exprDate && expr.exprDate.length === 2) {
        expr.begin = expr.exprDate[0];
        expr.end = expr.exprDate[1];
      } else {
        expr.begin = '';
        expr.end = '';
      }
    });
  },
  { deep: true }
);

const save = async () => {
  if (!empFormRef.value) {
    ElMessage.error('表单未初始化');
    return;
  }

  empFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('表单验证失败，请检查输入');
      return;
    }

    let result;
    try {
      if (employee.value.id) {
        result = await updateApi(employee.value);
      } else {
        result = await addApi(employee.value);
      }

      if (result.code === 1) {
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        search();
      } else {
        ElMessage.error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      ElMessage.error('An error occurred while saving');
    }
  });
};

//表单校验规则
const rules = ref({
  username: [
    { required: true, message: 'please input username', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: 'please input username length should be 2 to 20 characters',
      trigger: 'blur',
    },
  ],
  name: [
    { required: true, message: 'please input name', trigger: 'blur' },
    {
      min: 2,
      max: 10,
      message: 'please input name length should be 2 to 10 characters',
      trigger: 'blur',
    },
  ],
  gender: [
    { required: true, message: 'please select gender', trigger: 'change' },
  ],
  phone: [
    { required: true, message: 'please input phone number', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: 'please input valid phone number',
      trigger: 'blur',
    },
  ],
});

const empFormRef = ref(null);
const editEmp = async (id) => {
  try {
    const result = await queryByIdApi(id);
    if (result.code === 1) {
      // 深拷贝数据，避免修改原数据
      employee.value = JSON.parse(JSON.stringify(result.data));

      dialogVisible.value = true;
      dialogTitle.value = 'Edit Employee';

      // 处理工作经验
      if (employee.value.exprList?.length) {
        employee.value.exprList.forEach((expr) => {
          // 确保 begin 和 end 存在
          expr.exprDate = [expr.begin || '', expr.end || ''];
        });
      }
    }
  } catch (error) {
    console.error('Error fetching employee data:', error);
    ElMessage.error('Failed to fetch employee data');
  }
};

const deleteEmp = (id) => {
  // 从列表中找到要删除的员工
  const employee = empList.value.find((emp) => emp.id === id);
  const employeeName = employee ? employee.name : 'this employee';

  ElMessageBox.confirm(
    `Are you sure you want to delete ${employeeName}?`,
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await deleteApi(id);
      if (result.code == 1) {
        ElMessage.success(`${employeeName} deleted successfully`);
        search();
      } else {
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage.info('Delete canceled');
    });
};

const multipleSelection = ref([]);

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection.map((item) => item.id);
};

const deleteByIds = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('Please select at least one employee to delete');
    return;
  }

  const selectedEmployees = empList.value.filter((emp) =>
    multipleSelection.value.includes(emp.id)
  );

  // 获取员工名字
  const names = selectedEmployees.map((emp) => emp.name).join(', ');

  // 如果有些ID在列表中找不到，显示ID作为后备
  if (selectedEmployees.length < multipleSelection.value.length) {
    const missingIds = multipleSelection.value.filter(
      (id) => !selectedEmployees.some((emp) => emp.id === id)
    );
    ElMessage.warning(
      `Some employee IDs not found in list: ${missingIds.join(', ')}`
    );
  }

  ElMessageBox.confirm(
    `Are you sure you want to delete ${multipleSelection.value.length} selected employee(s): ${names || 'Unknown'}?`,
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await deleteApi(multipleSelection.value);
      if (result.code === 1) {
        ElMessage.success(
          `${multipleSelection.value.length} employee(s) deleted successfully`
        );
        search();
      } else {
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage.info('Batch delete canceled');
    });
};
</script>

<template>
  <h1>员工管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
      <el-form-item label="Name:">
        <el-input v-model="searchEmp.name" placeholder="please input name" />
      </el-form-item>
      <el-form-item label="Gender:">
        <el-select
          v-model="searchEmp.gender"
          placeholder="please select gender"
          style="width: 120px"
          clearable
        >
          <el-option label="Male" :value="1" />
          <el-option label="Female" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="Date of Job:">
        <el-date-picker
          v-model="searchEmp.date"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search" style="width: 80px"
          >search</el-button
        >
        <el-button type="info" @click="clear" style="width: 80px"
          >clear</el-button
        >
      </el-form-item>
    </el-form>
  </div>

  <div class="container">
    <el-button type="primary" @click="addEmp">+ 新增员工</el-button>
    <el-button type="danger" @click="deleteByIds">- 批量删除</el-button>
  </div>

  <div class="container">
    <el-table
      @selection-change="handleSelectionChange"
      :data="empList"
      style="width: 100%"
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ textAlign: 'center' }"
      border
    >
      <el-table-column type="selection" width="55" />
      <!-- selection 列宽可以小点 -->

      <el-table-column property="name" label="Name" width="120" />

      <el-table-column property="gender" label="Gender" width="150">
        <template #default="{ row }">
          <el-tag :type="row.gender === 1 ? 'primary' : 'success'" size="small">
            {{ row.gender === 1 ? 'Male' : 'Female' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column property="image" label="Avatar" width="120">
        <template #default="{ row }">
          <el-image
            :src="row.image"
            style="
              width: 50px;
              height: 50px;
              border-radius: 50%;
              object-fit: cover;
            "
            :preview-src-list="[row.image]"
            fit="cover"
          />
        </template>
      </el-table-column>

      <el-table-column property="deptName" label="Department" width="120" />

      <el-table-column property="job" label="Job" width="180">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">
            <span v-if="row.job === 1">Class Teacher</span>
            <span v-else-if="row.job === 2">Teacher</span>
            <span v-else-if="row.job === 3">Director of Student Affairs</span>
            <span v-else-if="row.job === 4"
              >Director of Teaching and Research</span
            >
            <span v-else-if="row.job === 5">Counselor</span>
            <span v-else>Unknown</span>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column property="entryDate" label="Entry Date" width="180" />

      <el-table-column property="updateTime" label="Update Time" width="130" />

      <el-table-column label="Actions" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editEmp(scope.row.id)">
            Edit
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteEmp(scope.row.id)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div class="container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 50, 100]"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <!-- 新增/修改员工的对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      :model="employee"
      label-width="80px"
      :rules="rules"
      ref="empFormRef"
    >
      <!-- 基本信息 -->
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Username" prop="username">
            <el-input
              v-model="employee.username"
              placeholder="Please enter the employee username, 2-20 characters"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Name" prop="name">
            <el-input
              v-model="employee.name"
              placeholder="Please enter the employee name, 2-10 characters"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Gender" prop="gender">
            <el-select
              v-model="employee.gender"
              placeholder="Please select gender"
              style="width: 100%"
            >
              <el-option
                v-for="gender in genders"
                :key="gender.value"
                :label="gender.name"
                :value="gender.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Phone" prop="phone">
            <el-input
              v-model="employee.phone"
              placeholder="请输入员工手机号"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Position">
            <el-select
              v-model="employee.job"
              placeholder="请选择职位"
              style="width: 100%"
            >
              <el-option
                v-for="job in jobs"
                :key="job.value"
                :label="job.name"
                :value="job.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Salary">
            <el-input
              v-model="employee.salary"
              placeholder="请输入员工薪资"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Department">
            <el-select
              v-model="employee.deptId"
              placeholder="请选择部门"
              style="width: 100%"
            >
              <el-option
                v-for="dept in depts"
                :key="dept.value"
                :label="dept.name"
                :value="dept.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Entry Date">
            <el-date-picker
              v-model="employee.entryDate"
              type="date"
              style="width: 100%"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="Avatar" label-width="80px">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="{ token: token }"
            >
              <img v-if="employee.image" :src="employee.image" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 工作经历 -->
      <!-- 第六行 -->
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form-item label="Career" label-width="100px">
            <el-button type="success" size="small" @click="addExpr"
              >+ 添加工作经历</el-button
            >
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第七行 ...  工作经历 -->
      <el-row
        :gutter="3"
        v-for="(expr, index) in employee.exprList"
        :key="index"
      >
        <el-col :span="10">
          <el-form-item size="small" label="时间" label-width="80px">
            <el-date-picker
              v-model="expr.exprDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item size="small" label="Company" label-width="60px">
            <el-input
              v-model="expr.company"
              placeholder="请输入公司名称"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item size="small" label="Position" label-width="60px">
            <el-input v-model="expr.job" placeholder="请输入职位"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="2">
          <el-form-item size="small" label-width="0px">
            <el-button type="danger" @click="removeExpr(index)"
              >- Delete</el-button
            >
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="save">save</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  margin: 10px 0;
}

.avatar {
  height: 40px;
}
.avatar-uploader .avatar {
  width: 78px;
  height: 78px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  border-radius: 10px;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}
</style>
