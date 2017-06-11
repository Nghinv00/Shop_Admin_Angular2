﻿import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../core/base/component.base';


@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.css']
})
export class RoleComponent extends BaseComponent {

    public pageIndex: number = this._pageConstants.pageIndex;
    public pageSize: number = this._pageConstants.pageSize;
    public pageDisplay: number = this._pageConstants.pageDisplay;
    public totalRow: number;
    public filter: string = "";
    public roles: any[];
    public entity: any;

    @ViewChild('modalAddEdit') public modalAddEdit: ModalDirective;

    constructor() { super() }

    ngOnInit() {
        this.loadData()
    }

    loadData() {
        this._dataService.get('/api/appRole/getlistpaging?page=' + this.pageIndex + '&pageSize=' + this.pageSize + '&filter=' + this.filter)
            .subscribe((response: any) => {
                this.roles = response.Items;
                this.pageIndex = response.PageIndex;
                this.pageSize = response.PageSize;
                this.totalRow = response.TotalRows;
            })
    }

    loadIdRole(id: any) {
        this._dataService.get('/api/appRole/detail/' + id)
            .subscribe((response: any) => {
                this.entity = response;
            })
    }

    pageChanged(event: any): void {
        this.pageIndex = event.page;
        this.loadData();
    }

    showAddModel(): void {
        this.entity = {};
        this.modalAddEdit.show();
    }

    showEditModel(id: any): void {
        this.loadIdRole(id);
        this.modalAddEdit.show();
    }

    saveChange(valid: boolean) {
        if (valid) {
            if (this.entity.Id == undefined) {
                this._dataService.post('/api/appRole/add', JSON.stringify(this.entity)).subscribe((response: any) => {
                    this.loadData();
                    this.modalAddEdit.hide();
                    this._notificationService.printSuccessMessage(this._messageContstants.CREATED_OK_MSG);
                }, error => this._dataService.handleError(error))
            }
            else {
                this._dataService.put('/api/appRole/update', JSON.stringify(this.entity)).subscribe((response: any) => {
                    this.loadData();
                    this.modalAddEdit.hide();
                    this._notificationService.printSuccessMessage(this._messageContstants.UPDATED_OK_MSG);
                }, error => this._dataService.handleError(error))
            }
        }
    }

    deleteItem(id: any) {
        this._notificationService.printConfirmationDialog(this._messageContstants.CONFIRM_DELETE_MSG, () => this.deleteItemRole(id));
    }
    deleteItemRole(id: any) {
        this._dataService.delete('/api/appRole/delete', 'id', id).subscribe((response: any) => {
            this.loadData();
            this._notificationService.printSuccessMessage(this._messageContstants.DELETED_OK_MSG)
        })
    }
}
