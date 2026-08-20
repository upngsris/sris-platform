import {defineField,defineType} from "sanity";
export const researchProject=defineType({
 name:"researchProject",title:"Research Project",type:"document",
 fields:[
  defineField({name:"title",type:"string",validation:r=>r.required()}),
  defineField({name:"slug",type:"slug",options:{source:"title"},validation:r=>r.required()}),
  defineField({name:"discipline",type:"string"}),
  defineField({name:"year",type:"number"}),
  defineField({name:"summary",type:"text",rows:4}),
  defineField({name:"coverImage",type:"image",options:{hotspot:true},fields:[defineField({name:"alt",type:"string"})]}),
  defineField({name:"status",type:"string",options:{list:["Draft","Active","Completed","Archived"]}})
 ]
});
