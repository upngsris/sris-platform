import {defineField,defineType} from "sanity";
export const event=defineType({
 name:"event",title:"Event",type:"document",
 fields:[
  defineField({name:"title",type:"string",validation:r=>r.required()}),
  defineField({name:"slug",type:"slug",options:{source:"title"},validation:r=>r.required()}),
  defineField({name:"startsAt",type:"datetime",validation:r=>r.required()}),
  defineField({name:"endsAt",type:"datetime"}),
  defineField({name:"venue",type:"string"}),
  defineField({name:"summary",type:"text",rows:3}),
  defineField({name:"image",type:"image",options:{hotspot:true},fields:[defineField({name:"alt",type:"string"})]})
 ]
});
