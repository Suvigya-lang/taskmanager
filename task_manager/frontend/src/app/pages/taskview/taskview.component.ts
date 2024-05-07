import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-taskview',
  templateUrl: './taskview.component.html',
  styleUrls: ['./taskview.component.scss']
})
export class TaskviewComponent implements OnInit {
  lists: any[]=[];
  tasks: any[]=[];
  id: string="";
  taskExists :any;

  selectedListId : string="";

  constructor(private taskService :TaskService,private route :ActivatedRoute,private router :Router) { 
    
  }

  ngOnInit(): void {
    // this.route.params.subscribe((params :Params)=>{
    //   console.log(params);
    //   this.taskService.getTasks(params['listId']).subscribe((tasks:any)=>{
    //     this.tasks=tasks
    //   })
    this.route.params.subscribe((params :Params)=>{
      console.log(params);
      if(params['listId']){
        this.selectedListId=params['listId'];
        this.taskService.getTasks(params['listId']).subscribe((tasks:any)=>{
          this.tasks=tasks
          this.taskExists="exists";
        })
      }
      else{
        this.taskExists=undefined;
      }
      
    });
    this.taskService.getLists().subscribe((lists: any)=>{
      this.lists=lists;
    })
  }
  onTaskClick(task:any){
    this.taskService.complete(task).subscribe(()=>{
      console.log("Completed Successfully");
      task.completed=!task.completed;
    });
    
  }
  onDeleteClick(){
    this.taskService.deleteList(this.selectedListId).subscribe((res :any)=>{
      console.log(res);
      this.router.navigateByUrl('/lists');
    });
  }
  onTaskDelete(id: string){
   this.taskService.deleteTask(this.selectedListId,id).subscribe((res :any)=>{
      console.log(res);
      this.tasks= this.tasks.filter(val=> val._id !== id);
    });
}


  


}
