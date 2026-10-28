import{l as m,h as A,L as o}from"./index-DpRNdQZt.js";/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Five-stage application Journey position, shared by the responsive Journey
 * rail and the desktop Loan Applications table (which exposes it as row data).
 */const _=["sales-submit","missing-doc-check","admin-loan-submit","bank-decision","result"],g=["cash-submit","cash-review","cash-accepted","cash-delivery","cash-complete"],l=t=>{const e=m(t),c=A(t),n=t.purchase_method==="Cash",s=t.deal_finance,a=e==="Closed"||c==="Choose Close or Resubmit"||c==="Contact Approved Customer"?4:e==="Bank"||t.status===o.IN_PROCESS?3:e==="Admin"&&(c==="Submit to Bank"||c==="Resubmit to Bank")?2:1,u=(s==null?void 0:s.sale_status)==="Cancelled"||[o.REJECT,o.CANCELLED].includes(t.status),r=!!(s!=null&&s.finance_completed_at),d=(s==null?void 0:s.sale_status)==="Customer Accepted"||e==="Closed"&&t.status===o.APPROVE,h=u||r||(s==null?void 0:s.sale_status)==="Bike Delivered"?4:d?3:t.status===o.APPROVE||(s==null?void 0:s.sale_status)==="Pending Acceptance"?2:1,C=n?h:a;return{isCash:n,currentIndex:C,stage:(n?g:_)[C],closed:n?r||u:e==="Closed"}};export{l as g};
