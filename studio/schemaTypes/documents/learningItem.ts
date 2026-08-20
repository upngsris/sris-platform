import {defineField,defineType} from "sanity";
export const learningItem=defineType({
 name:"learningItem",title:"Learning Item",type:"document",
 fields:[
  defineField({name:"title",type:"string",validation:r=>r.required()}),
  defineField({name:"slug",type:"slug",options:{source:"title"},validation:r=>r.required()}),
  defineField({name:"kind",type:"string",options:{list:["Skills Track","Laboratory Practical","Knowledge Sharing"]}}),
  defineField({name:"summary",type:"text",rows:4}),
  defineField({name:"image",type:"image",options:{hotspot:true},fields:[defineField({name:"alt",type:"string"})]})
 ]
});
