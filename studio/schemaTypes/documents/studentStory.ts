import {defineField,defineType} from "sanity";
export const studentStory=defineType({
 name:"studentStory",title:"Student Story",type:"document",
 fields:[
  defineField({name:"title",type:"string"}),
  defineField({name:"slug",type:"slug",options:{source:"title"},validation:r=>r.required()}),
  defineField({name:"quote",type:"text",rows:3,validation:r=>r.required()}),
  defineField({name:"studentName",type:"string"}),
  defineField({name:"discipline",type:"string"}),
  defineField({name:"image",type:"image",options:{hotspot:true},fields:[defineField({name:"alt",type:"string"})]})
 ]
});
