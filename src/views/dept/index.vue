<script setup>

import { ref , onMounted} from 'vue';
import { queryAllApi, addApi , queryByIdApi, updateApi,deleteApi} from "@/api/dept";
import { ElMessage , ElMessageBox} from 'element-plus';

onMounted(() => {
   search();
});

const deptList = ref([]);

const search = async () => {
   const result = await queryAllApi();

   if(result.code){
       deptList.value = result.data;
   }
}

const dialogFormVisible = ref(false);
const formTitle = ref('');

const dept = ref({
    name:''
});

const addDept = () => {
    dialogFormVisible.value = true;
    formTitle.value = '新增部门';
    dept.value={
        name:''
    };

    if(deptForm.value){
        deptForm.value.resetFields();
    }

};
const save = async () => {
  // 1. 前置校验：表单ref是否绑定
  if (!deptForm.value) {
    ElMessage.error('表单未初始化');
    return;
  }

  // 2. 表单校验
  deptForm.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('表单验证失败，请检查输入');
      return;
    }

    let result;
    // 3. 表单验证通过，提交数据
    try {
        if(dept.value.id) {
          result = await updateApi(dept.value);
        } else {
          result = await addApi(dept.value);
        }

      // 4. 成功码判断（和后端约定一致）
      const successCode = 200; // 也可以使用常量，如 SUCCESS_CODE
      if (result.code === successCode) {
        ElMessage.success('部门添加成功');
        dialogFormVisible.value = false; // 关闭弹窗
        search(); // 刷新列表
        
        // 5. 重置表单（注意字段名要和后端一致）
        dept.value = { 
          name: '', 
          // create_time: '',  // 这些字段通常后端生成，不需要重置
          // update_time: '' 
        };
        
        // 可选：重置表单校验状态
        deptForm.value.resetFields();
      } else {
        // 6. 失败提示
        const errorMsg = result.msg || result.message || '部门添加失败，请重试';
        ElMessage.error(errorMsg);
      }
    } catch (error) {
      // 7. 网络错误或请求异常
      console.error('添加部门失败:', error);
      ElMessage.error('网络异常，请稍后重试');
    }
  });
};


const rules = ref({
  name: [
    { required: true, message: 'Please input department name', trigger: 'blur' },
    { min: 2, max: 10, message: 'Length should be 2 to 10', trigger: 'blur' },
  ]
});

const deptForm = ref(null);


const edit = async (id) => {

    const result = await queryByIdApi(id);

       if(deptForm.value){
        deptForm.value.resetFields();
    }

    if(result.code == 1){
        dept.value = result.data;
        dialogFormVisible.value = true;
        formTitle.value = '编辑部门';
        dept.value = result.data;
    }
}

const deleteById = async (id) => {
ElMessageBox.confirm(
    'Are you sure you want to delete this department?','Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(async () => {
        //confirmed
     const result = await deleteApi(id);
        if(result.code == 1){
            ElMessage.success('Department deleted successfully');
            search();
        } else {
          
            ElMessage.error(result.msg);
        }
    })
    .catch(() => {
        //canceled
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
 
   
};


</script>

<template>

<h1>部门管理</h1>
<div class="container">

     <el-button type="primary" @click="addDept">+ 新增部门</el-button>
</div>



<div class="container" >

    <el-table :data="deptList" border style="width: 100%" >
        <el-table-column type="index" label="序号" width="100" align="center"/>
        <el-table-column prop="name" label="部门名称" width="260" align="center"/>
        <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center"/>
        <el-table-column label="操作">
             <template #default="scope">
                <el-button type="primary" size="small"  @click="edit(scope.row.id)"><el-icon><Edit /></el-icon>Edit</el-button>
                <el-button type="danger" size="small" @click="deleteById(scope.row.id)"><el-icon><Delete /></el-icon>Delete</el-button>
            </template>
        </el-table-column>
  </el-table>
</div>


  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules"  ref="deptForm">
      <el-form-item label="Department name" label-width="120px" prop="name">
        <el-input v-model="dept.name" />
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
       
        <el-button  @click="dialogFormVisible = false">
          Cancel
        </el-button>

          <el-button type="primary" @click="save">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.container{
  margin: 10px 0;
}


</style>