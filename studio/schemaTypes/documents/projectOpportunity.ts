import {defineField,defineType} from "sanity";
export const projectOpportunity=defineType({
 name:"projectOpportunity",title:"Project Opportunity",type:"document",
 fields:[
  defineField({name:"title",type:"string",validation:r=>r.required()}),
  defineField({name:"slug",type:"slug",options:{source:"title"},validation:r=>r.required()}),
  defineField({name:"discipline",type:"string"}),
  defineField({name:"level",type:"string"}),
  defineField({name:"summary",type:"text",rows:4}),
  defineField({name:"applicationStatus",type:"string",options:{list:["Applications open","Positions available","Closed"]}}),
  defineField({name:"publishedAt",type:"datetime"})
 ]
});
