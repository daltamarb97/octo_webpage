import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataService } from 'app/core/services/delete-data.service';
import { FecthDataService } from 'app/core/services/fecth-data.service';
import { HoldDataService } from 'app/core/services/hold-data.service';
import { SetDataService } from 'app/core/services/set-data.service';
import { MessageComponent } from 'app/material-component/message-dialog/message-dialog.component';
import { OptionComponent } from 'app/material-component/option-dialog/option-dialog.component';

@Component({
  selector: 'app-chat-flow',
  templateUrl: './chat-flow.component.html',
  styleUrls: ['./chat-flow.component.css']
})
export class ChatFlowComponent implements OnInit {
  optionList: Array<any> = [];
  companyId:any;
  option:any;
  showOption:boolean = false;
  value='¡Hola!, Gracias por escribirnos al servicio al cliente de Porthos, escoge alguna de las siguientes funciones:'
  constructor(
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    public dialog: MatDialog,
  ) {
    this.optionList = [
      {flowId:'4dFVtx5OaZDX,KUPIzWS1' ,name: 'Pedir Menú'},
      {flowId:'4dFVtx5OaZDXK,UPIzWS1',name: 'Ubicación de restaurantes'},
      {flowId:'4dFVtx5OaZDXKUPIzWS1',name: 'Hacer un pedido'},
      {flowId:'4dFVtx5OaZDXKUPIzWS1',name: 'Estado de mi pedido'},
      {flowId:'4dFVtx5OaZDXKUPIzWS1',name: 'Hablar con servicio al cliente'}]
   }

  ngOnInit(): void {
    this.companyId = this.holdData.userInfo.companyId;

  }
  createOption(){
    const dialogRef = this.dialog.open(OptionComponent, {data: this.companyId});
  dialogRef.afterClosed()
  .subscribe(result =>{
    // Aquí escribes la función de guardar la opción     
    // this.setData.createCategory(
    //   this.companyId, 
    //   result
    // );  
  })
  }
  seeOption(option){
    this.option = option;
    this.showOption = true;
    console.log(this.option.name);
    
  }
  editMessage(){
    const dialogRef = this.dialog.open(MessageComponent, {data: this.companyId});
  dialogRef.afterClosed()
  .subscribe(result =>{
    // Aquí escribes la función de guardar la opción     
    // this.setData.createCategory(
    //   this.companyId, 
    //   result
    // );  
  })
  }
}
