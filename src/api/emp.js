import request from '@/utils/request';

export const queryPageApi = (name, gender, begin, end, page, pageSize) => {
  return request.get('/emps', {
    params: {
      name,
      gender,
      begin,
      end,
      page,
      pageSize,
    },
  });
};

export const addApi = (emp) => {
  return request.post('/emps', emp);
};

export const queryByIdApi = (id) => {
  return request.get(`/emps/${id}`);
};

export const updateApi = (emp) => {
  return request.put('/emps', emp);
};

export const deleteApi = (id) => {
  return request.delete(`/emps?ids=${id}`);
};
