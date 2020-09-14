import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { FecthDataService } from '../../../app/core/services/fecth-data.service';
import { SetDataService } from '../../../app/core/services/set-data.service';
import { HoldDataService } from '../../../app/core/services/hold-data.service';
import { DeleteDataService } from '../../../app/core/services/delete-data.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatDialog } from '@angular/material/dialog';
import { CategoryComponent } from '../../../app/material-component/category-dialog/category-dialog.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tagsCategories:any = [];
  tagsCategoriesNames:any = [];
  companyId:string;
  visible = true;
  selectable = true;
  removable = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<any[]>;
  tags: any = [];
  allTags:any[];
  showTags: boolean = false;
  step = 0;
  allowCreate:boolean =  false;
  showDeleteCategory:boolean = false;
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  constructor(
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    public dialog: MatDialog,
  ) {
   
   }
  ngOnInit(){
    this.companyId = this.holdData.userInfo.companyId;
    this.getCategories();
  }
   add(event: MatChipInputEvent,category): void {
    const input = event.input;
    const value = event.value;
    // Add our tag / value trim takes the extra whitespaces in both sides of the text
    if ((value || '').trim()) {
      this.setData.sendTagToCategories(this.companyId, category.categoryId,value.trim())
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  getCategories(){
    // get categories
    this.fetchData.getTags(this.companyId)
    .subscribe(data => {
      this.tagsCategoriesNames = data;
      this.tagsCategories = [];
    })
  }


  getSpecificTags(category){
    this.fetchData.getSpecificTag(category.categoryId,this.companyId)
    .subscribe(data => {
      this.tagsCategories = data;
    })
  }
 
  remove(tag,category): void {  
      this.deleteData.deleteTagFromCompany(this.companyId,category.categoryId,tag.tagId)
  }


  showDelete(){ 
   if(this.showDeleteCategory === true){
    this.showDeleteCategory = false;
    }else{
    this.showDeleteCategory = true;  }
  }


  eraseCategory(category){
    this.deleteData.deleteCategory(this.companyId,category.categoryId);    
  }

  addCategory(){
  const dialogRef = this.dialog.open(CategoryComponent, {data: this.companyId});
  dialogRef.afterClosed()
  .subscribe(result =>{
    // create new chat room        
    
    this.setData.createCategory(
      this.companyId, 
      result
    );  
  })
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
  createTags(){
    if(this.allowCreate === true){
      this.allowCreate =false;
    }else{
      this.allowCreate =true;
    }

  }
  eraseTags(){
    if(this.removable === true){
      this.removable = false;
    }else{
      this.removable = true;
    }
  }
}
