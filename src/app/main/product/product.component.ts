import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../core/base/component.base';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent extends BaseComponent implements OnInit {
  /*Declare modal */
  @ViewChild('addEditModal') public addEditModal: ModalDirective;
  @ViewChild("thumbnailImage") thumbnailImage;

  /*Product manage */
  public baseFolder: string = this._systemConstants.BASE_API;
  public entity: any;
  public totalRow: number;
  public pageIndex: number = this._pageConstants.pageIndex;
  public pageSize: number = this._pageConstants.pageSize;
  public pageDisplay: number = this._pageConstants.pageDisplay;
  public filterKeyword: string = '';
  public filterCategoryID: number;
  public products: any[];
  public productCategories: any[];
  public checkedItems: any[];

  /*Product manage */
  public imageEntity: any = {};
  public productImages: any = [];
  @ViewChild('imageManageModal') public imageManageModal: ModalDirective;
  @ViewChild("imagePath") imagePath;


  constructor(  ) { super()}
  ngOnInit() {
    this.search();
    this.loadProductCategories();

  }

  public createAlias() {
    this.entity.Alias = this._utilityService.MakeSeoTitle(this.entity.Name);
  }

  public search() {
    this._dataService.get('/api/product/getall?page=' + this.pageIndex + '&pageSize=' + this.pageSize + '&keyword=' + this.filterKeyword + '&categoryId=' + this.filterCategoryID)
      .subscribe((response: any) => {
        this.products = response.Items;

        this.pageIndex = response.PageIndex;
        this.pageSize = response.PageSize;
        this.totalRow = response.TotalRows;
        
      }, error => this._dataService.handleError(error));
  }

  public reset() {
    this.filterKeyword = '';
    this.filterCategoryID = null;
    this.search();
  }

  //Show add form
  public showAdd() {
    this.entity = { Content: '' };
    this.addEditModal.show();
  }

  //Show edit form
  public showEdit(id: string) {
    this._dataService.get('/api/product/detail/' + id).subscribe((response: any) => {
      this.entity = response;
      this.addEditModal.show();
    }, error => this._dataService.handleError(error));
  }

  public delete(id: string) {
    this._notificationService.printConfirmationDialog(this._messageContstants.CONFIRM_DELETE_MSG, () => {
      this._dataService.delete('/api/product/delete', 'id', id).subscribe((response: any) => {
        this._notificationService.printSuccessMessage(this._messageContstants.DELETED_OK_MSG);
        this.search();
      }, error => this._dataService.handleError(error));
    });
  }

  private loadProductCategories() {
    this._dataService.get('/api/productCategory/getallhierachy').subscribe((response: any[]) => {
      this.productCategories = response;
    }, error => this._dataService.handleError(error));
  }

  //Save change for modal popup
  public saveChanges(valid: boolean) {
    if (valid) {
      let fi = this.thumbnailImage.nativeElement;
      if (fi.files.length > 0) {
        this._uploadService.postWithFile('/api/upload/saveImage?type=product', null, fi.files).then((imageUrl: string) => {
          this.entity.ThumbnailImage = imageUrl;
        }).then(() => {
          this.saveData();
        });
      }
      else {
        this.saveData();
      }
    }
  }

  private saveData() {
    if (this.entity.ID == undefined) {
      this._dataService.post('/api/product/add', JSON.stringify(this.entity)).subscribe((response: any) => {
        this.search();
        this.addEditModal.hide();
        this._notificationService.printSuccessMessage(this._messageContstants.CREATED_OK_MSG);
      });
    }
    else {
      this._dataService.put('/api/product/update', JSON.stringify(this.entity)).subscribe((response: any) => {
        this.search();
        this.addEditModal.hide();
        this._notificationService.printSuccessMessage(this._messageContstants.UPDATED_OK_MSG);
      }, error => this._dataService.handleError(error));
    }
  }

  public pageChanged(event: any): void {
    this.pageIndex = event.page;
    this.search();
  }

  public keyupHandlerContentFunction(e: any) {
    this.entity.Content = e;
  }

  public deleteMulti() {
    this.checkedItems = this.products.filter(x => x.Checked);
    var checkedIds = [];
    for (var i = 0; i < this.checkedItems.length; ++i)
      checkedIds.push(this.checkedItems[i]["ID"]);

    this._notificationService.printConfirmationDialog(this._messageContstants.CONFIRM_DELETE_MSG, () => {
      this._dataService.delete('/api/product/deletemulti', 'checkedProducts', JSON.stringify(checkedIds)).subscribe((response: any) => {
        this._notificationService.printSuccessMessage(this._messageContstants.DELETED_OK_MSG);
        this.search();
      }, error => this._dataService.handleError(error));
    });
  }

  /*Image management*/
  public showImageManage(id: number) {
    this.imageEntity = {
      ProductId: id
    };
    this.loadProductImages(id);
    this.imageManageModal.show();
  }

  public loadProductImages(id: number) {
    this._dataService.get('/api/productImage/getall?productId=' + id).subscribe((response: any[]) => {
      this.productImages = response;
    }, error => this._dataService.handleError(error));
  }
  
  public deleteImage(id: number) {
    this._notificationService.printConfirmationDialog(this._messageContstants.CONFIRM_DELETE_MSG, () => {
      this._dataService.delete('/api/productImage/delete', 'id', id.toString()).subscribe((response: any) => {
        this._notificationService.printSuccessMessage(this._messageContstants.DELETED_OK_MSG);
        this.loadProductImages(this.imageEntity.ProductId);
      }, error => this._dataService.handleError(error));
    });
  }

  public saveProductImage(isValid: boolean) {
    if (isValid) {
      let fi = this.imagePath.nativeElement;
      if (fi.files.length > 0) {
        this._uploadService.postWithFile('/api/upload/saveImage?type=product', null, fi.files).then((imageUrl: string) => {
          this.imageEntity.Path = imageUrl;
          this._dataService.post('/api/productImage/add', JSON.stringify(this.imageEntity)).subscribe((response: any) => {
            this.loadProductImages(this.imageEntity.ProductId);
            this._notificationService.printSuccessMessage(this._messageContstants.CREATED_OK_MSG);
          });
        });
      }
    }
  }

}