export type NavLink={title:string;description:string;href:string};
export type NavGroup={name:string;intro:string;links:NavLink[]};

export const navigation:NavGroup[]=[
{name:"About",intro:"Who we are, why SRIS exists and the people behind it.",links:[
{title:"About SRIS",description:"Our story and purpose",href:"/about"},
{title:"Mission & Vision",description:"What we are working toward",href:"/about/mission-vision"},
{title:"Our Team",description:"Meet SRIS leadership and coordinators",href:"/about/team"},
{title:"Contact Us",description:"Connect with the society",href:"/about/contact"}]},
{name:"Explore",intro:"Discover research, practical work and student-led opportunities.",links:[
{title:"Research Projects",description:"Student research and investigation",href:"/explore/research"},
{title:"Lab Practicals",description:"Hands-on scientific learning",href:"/explore/lab-practicals"},
{title:"Projects to Join",description:"Open opportunities for students",href:"/explore/projects-to-join"},
{title:"Student Showcase",description:"Projects built by students",href:"/community/showcase"}]},
{name:"Learn & Do",intro:"Develop useful skills and put classroom knowledge into practice.",links:[
{title:"Skills Tracks",description:"Structured practical learning",href:"/learn/skills"},
{title:"Knowledge Sharing",description:"Students teaching students",href:"/learn/knowledge-sharing"},
{title:"News & Articles",description:"Ideas, explainers and updates",href:"/learn/articles"}]},
{name:"Community",intro:"Take part in SRIS activities and connect across disciplines.",links:[
{title:"Events",description:"Workshops, talks and activities",href:"/community/events"},
{title:"Membership",description:"Become part of SRIS",href:"/community/membership"},
{title:"Collaborations",description:"Work with SRIS",href:"/community/collaborations"},
{title:"Student Showcase",description:"See what students are building",href:"/community/showcase"}]}
];
