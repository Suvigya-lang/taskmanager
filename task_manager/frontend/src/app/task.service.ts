import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService : WebRequestService) {}
   
  createList(title: string) {
    return this.webReqService.post('lists',{title});
  }
  updateList(id :string,title: string) {
    return this.webReqService.patch(`lists/${id}`,{title});
  }
  createTask(title: string,listId: string) {
    return this.webReqService.post(`lists/${listId}/tasks`,{title});
  }
  updateTask(listId: string,taskId :string,title: string) {
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`,{title});
  }
  getLists(){
    return this.webReqService.get('lists');
  }
  getTasks(listId :string){
    return this.webReqService.get(`lists/${listId}/tasks`);
  }
  complete(task:any){
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`,{
      completed: !task.completed
    });
  }
  deleteList(id: string ){
    return this.webReqService.delete(`lists/${id}`);

  }
  deleteTask(listId: string,taskId: string){
    return this.webReqService.delete(`lists/${listId}/tasks/${taskId}`);
  }
  
}
