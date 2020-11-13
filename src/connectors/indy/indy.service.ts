import {
  HttpService,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../organizations/organization.entity';
import { CredentialIssueRequest } from '../../requests/credential-issue-request.entity';
import { CredentialVerifyRequest } from '../../requests/credential-verify-request.entity';
import { ConnectorService } from '../connector-service.interface';
import {
  IndyConnectionResponse,
  IndyInvitation,
} from './indy-invitation.entity';
import {
  IndyCredDefResponse,
  IndySchema,
  IndySchemaResponse,
} from './indy-schema.entity';

//  Proof request:
// http://localhost:9001/present-proof/send-request
// {
//   "comment": "string",
//   "connection_id": "6097a5b1-c5b5-430d-afff-f19c65ec039a",
//   "proof_request": {
//     "name": "Proof request",
//     "nonce": "1234567890",
//     "requested_attributes": {
//       "firstname": {
//         "name": "firstname",
//         "restrictions": [
//         { "schema_id": "Pm8J9C3BLVSbqBQpVYoJho:2:NameCredential:0.0.1" }
//         ]
//       }
//     },
//     "requested_predicates": {},
//     "version": "1.0"
//   },
//   "trace": false
// }
// Response:
// {
//   "auto_present": false,
//   "updated_at": "2020-11-13 15:34:18.822405Z",
//   "state": "request_sent",
//   "thread_id": "1017f080-dddf-4dcc-a2ad-bdb515149f66",
//   "created_at": "2020-11-13 15:34:18.822405Z",
//   "role": "verifier",
//   "connection_id": "6097a5b1-c5b5-430d-afff-f19c65ec039a",
//   "presentation_exchange_id": "e580753b-44aa-4ee7-a72b-b55f51fde110",
//   "trace": false,
//   "presentation_request": {
//     "name": "Proof request",
//     "nonce": "1234567890",
//     "requested_attributes": {
//       "firstname": {
//         "name": "firstname",
//         "restrictions": [
//           {
//             "schema_id": "Pm8J9C3BLVSbqBQpVYoJho:2:NameCredential:0.0.1"
//           }
//         ]
//       }
//     },
//     "requested_predicates": {},
//     "version": "1.0"
//   },
//   "initiator": "self",
//   "presentation_request_dict": {
//     "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/request-presentation",
//     "@id": "1017f080-dddf-4dcc-a2ad-bdb515149f66",
//     "request_presentations~attach": [
//       {
//         "@id": "libindy-request-presentation-0",
//         "mime-type": "application/json",
//         "data": {
//           "base64": "eyJuYW1lIjogIlByb29mIHJlcXVlc3QiLCAibm9uY2UiOiAiMTIzNDU2Nzg5MCIsICJyZXF1ZXN0ZWRfYXR0cmlidXRlcyI6IHsiZmlyc3RuYW1lIjogeyJuYW1lIjogImZpcnN0bmFtZSIsICJyZXN0cmljdGlvbnMiOiBbeyJzY2hlbWFfaWQiOiAiUG04SjlDM0JMVlNicUJRcFZZb0pobzoyOk5hbWVDcmVkZW50aWFsOjAuMC4xIn1dfX0sICJyZXF1ZXN0ZWRfcHJlZGljYXRlcyI6IHt9LCAidmVyc2lvbiI6ICIxLjAifQ=="
//         }
//       }
//     ],
//     "comment": "string"
//   }
// }

// Credential
// http://localhost:9001/issue-credential/send
// {
//   "auto_remove": false,
//   "comment": "string",
//   "connection_id": "6097a5b1-c5b5-430d-afff-f19c65ec039a",
//   "cred_def_id": "Pm8J9C3BLVSbqBQpVYoJho:3:CL:31:default",
//   "credential_proposal": {
//     "@type": "issue-credential/1.0/credential-preview",
//     "attributes": [
//       {
//         "name": "firstname",
//         "value": "Hidde-Jan"
//       },
//       {
//         "name": "middlename",
//         "value": "van"
//       },
//       {
//         "name": "lastname",
//         "value": "Jongsma"
//       }
//     ]
//   },
//   "issuer_did": "Pm8J9C3BLVSbqBQpVYoJho",
//   "schema_id": "Pm8J9C3BLVSbqBQpVYoJho:2:NameCredential:0.0.1",
//   "schema_issuer_did": "Pm8J9C3BLVSbqBQpVYoJho",
//   "schema_name": "NameCredential",
//   "schema_version": "0.0.1",
//   "trace": false
// }
// Response:
// {
//   "credential_offer": {
//     "schema_id": "Pm8J9C3BLVSbqBQpVYoJho:2:NameCredential:0.0.1",
//     "cred_def_id": "Pm8J9C3BLVSbqBQpVYoJho:3:CL:31:default",
//     "key_correctness_proof": {
//       "c": "62053495154267092665168485420357788026420911635163448338135942364628711008300",
//       "xz_cap": "773192239306392423458696445807172668419003696360956308827621889885142907551689004418011242261844088899846017885433180223247704885361933307353456812562084252403007663260947287160685807803442428137976912150849220146489931470790255246495579395085486417847356274110862427514685615745423425033804295980391765628754159572622725236773149820560636749780909312841568848256505496598481900011212355282176136841307482624862591897848671544843553518753603841948476594275788157543184632346728770609505577148099074783716726630452985989786077845257098227176688550535310037733751023976082379366625580621848641857206257640243243100865368575413187206691069522620124353363383360986045477249623406409414818150322753",
//       "xr_cap": [
//         [
//           "firstname",
//           "1175532982178051946032563225310795576496018695132351612726860764992501596761404483234636847486032570605418963197828737410230223995139290100130249059919475328081457804221213212449149090224938569895142998843764012843936900659468946899880190157444630231200319185307620328324469545892352164935670142775063125991295667200913632744431504788255847005393868194279002341524199638229441917701539388875820438902010273759191619797245620382896442563126243338945563562765134780258259316302998535918476678364934372076635594910910822739836973660583521870891405806733286178088048561011963660289936477306002859040167709792172103982968174660908825631138749459500802563787717045861582129193470076258220059217886874"
//         ],
//         [
//           "master_secret",
//           "1212111904692817479439548278268927969628332009931972001817365356531755619444590365275465178148497953452562746040822197945837089944751141860489482217827797833325858622893620509552422052789972136368196319645150146506904832707446626602151748326284107696866047447503072657242091029932963138585921879412093070878909272163483609187550452441417013305685287482078913860932379557888172304470341149275052721996183752789377007536838900521216190396530159002938002240904309976507468887883825698877900290161780331955977670747109776442883554471953834246521218719982535076972704380898678184324033048766131469360812353227576277868740953436210230055283612963912731073594760701801577275158878089380163742703312287"
//         ],
//         [
//           "lastname",
//           "276185205991634936116896329921364628247888104854714731147990629652682221197065186926770611644570679073882622146480131441853694473584189002476064528194246377990698394585960251127809062639960493852910618049690837550830593253459649501058287216253487725813376949901709966931860344240956982982233772993002384056220134912039758593196629319758376835266723393952902065507659607369686315022280436884217139956572821671361083241909197816251482103818823346341920156455101929213870313519239286310348284079979200997776312753355272610640955799976642195977452840853971057374251309826893489221678438684158605884273666985438522898867190495816906565668391740462152093460963869080661332275765630361958419107466172"
//         ],
//         [
//           "middlename",
//           "424693192724282806193776900865123388368656855548291355488100232932411020140090633737927591255495818297493193315448830527198809566829677922608474595616020080177733734532992367479549859970768192444680394882762015598360347127761340573264862934775385147950946037760506817688501610926805225721155742368000474756091157222930779604098112636068552182474081073207843662422841371696236329026201245536482273216451376252674244282839778911079381535942691268186432694640427529657957479073238239370746643190631625111888254804708314496107719534955665754644170046681126598474562072867553230085487048243468029490068480957575107057582758477698186766336872827627344186463900126670406109724100743329093222043312311"
//         ]
//       ]
//     },
//     "nonce": "1010154355188393226041266"
//   },
//   "updated_at": "2020-11-13 15:08:23.829005Z",
//   "thread_id": "f9e85bbb-3e07-4e7e-98e5-d0c0ecf7998e",
//   "connection_id": "6097a5b1-c5b5-430d-afff-f19c65ec039a",
//   "credential_definition_id": "Pm8J9C3BLVSbqBQpVYoJho:3:CL:31:default",
//   "initiator": "self",
//   "auto_offer": false,
//   "state": "offer_sent",
//   "created_at": "2020-11-13 15:08:23.829005Z",
//   "role": "issuer",
//   "trace": false,
//   "credential_offer_dict": {
//     "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/offer-credential",
//     "@id": "f9e85bbb-3e07-4e7e-98e5-d0c0ecf7998e",
//     "~thread": {},
//     "offers~attach": [
//       {
//         "@id": "libindy-cred-offer-0",
//         "mime-type": "application/json",
//         "data": {
//           "base64": "eyJzY2hlbWFfaWQiOiAiUG04SjlDM0JMVlNicUJRcFZZb0pobzoyOk5hbWVDcmVkZW50aWFsOjAuMC4xIiwgImNyZWRfZGVmX2lkIjogIlBtOEo5QzNCTFZTYnFCUXBWWW9KaG86MzpDTDozMTpkZWZhdWx0IiwgImtleV9jb3JyZWN0bmVzc19wcm9vZiI6IHsiYyI6ICI2MjA1MzQ5NTE1NDI2NzA5MjY2NTE2ODQ4NTQyMDM1Nzc4ODAyNjQyMDkxMTYzNTE2MzQ0ODMzODEzNTk0MjM2NDYyODcxMTAwODMwMCIsICJ4el9jYXAiOiAiNzczMTkyMjM5MzA2MzkyNDIzNDU4Njk2NDQ1ODA3MTcyNjY4NDE5MDAzNjk2MzYwOTU2MzA4ODI3NjIxODg5ODg1MTQyOTA3NTUxNjg5MDA0NDE4MDExMjQyMjYxODQ0MDg4ODk5ODQ2MDE3ODg1NDMzMTgwMjIzMjQ3NzA0ODg1MzYxOTMzMzA3MzUzNDU2ODEyNTYyMDg0MjUyNDAzMDA3NjYzMjYwOTQ3Mjg3MTYwNjg1ODA3ODAzNDQyNDI4MTM3OTc2OTEyMTUwODQ5MjIwMTQ2NDg5OTMxNDcwNzkwMjU1MjQ2NDk1NTc5Mzk1MDg1NDg2NDE3ODQ3MzU2Mjc0MTEwODYyNDI3NTE0Njg1NjE1NzQ1NDIzNDI1MDMzODA0Mjk1OTgwMzkxNzY1NjI4NzU0MTU5NTcyNjIyNzI1MjM2NzczMTQ5ODIwNTYwNjM2NzQ5NzgwOTA5MzEyODQxNTY4ODQ4MjU2NTA1NDk2NTk4NDgxOTAwMDExMjEyMzU1MjgyMTc2MTM2ODQxMzA3NDgyNjI0ODYyNTkxODk3ODQ4NjcxNTQ0ODQzNTUzNTE4NzUzNjAzODQxOTQ4NDc2NTk0Mjc1Nzg4MTU3NTQzMTg0NjMyMzQ2NzI4NzcwNjA5NTA1NTc3MTQ4MDk5MDc0NzgzNzE2NzI2NjMwNDUyOTg1OTg5Nzg2MDc3ODQ1MjU3MDk4MjI3MTc2Njg4NTUwNTM1MzEwMDM3NzMzNzUxMDIzOTc2MDgyMzc5MzY2NjI1NTgwNjIxODQ4NjQxODU3MjA2MjU3NjQwMjQzMjQzMTAwODY1MzY4NTc1NDEzMTg3MjA2NjkxMDY5NTIyNjIwMTI0MzUzMzYzMzgzMzYwOTg2MDQ1NDc3MjQ5NjIzNDA2NDA5NDE0ODE4MTUwMzIyNzUzIiwgInhyX2NhcCI6IFtbImZpcnN0bmFtZSIsICIxMTc1NTMyOTgyMTc4MDUxOTQ2MDMyNTYzMjI1MzEwNzk1NTc2NDk2MDE4Njk1MTMyMzUxNjEyNzI2ODYwNzY0OTkyNTAxNTk2NzYxNDA0NDgzMjM0NjM2ODQ3NDg2MDMyNTcwNjA1NDE4OTYzMTk3ODI4NzM3NDEwMjMwMjIzOTk1MTM5MjkwMTAwMTMwMjQ5MDU5OTE5NDc1MzI4MDgxNDU3ODA0MjIxMjEzMjEyNDQ5MTQ5MDkwMjI0OTM4NTY5ODk1MTQyOTk4ODQzNzY0MDEyODQzOTM2OTAwNjU5NDY4OTQ2ODk5ODgwMTkwMTU3NDQ0NjMwMjMxMjAwMzE5MTg1MzA3NjIwMzI4MzI0NDY5NTQ1ODkyMzUyMTY0OTM1NjcwMTQyNzc1MDYzMTI1OTkxMjk1NjY3MjAwOTEzNjMyNzQ0NDMxNTA0Nzg4MjU1ODQ3MDA1MzkzODY4MTk0Mjc5MDAyMzQxNTI0MTk5NjM4MjI5NDQxOTE3NzAxNTM5Mzg4ODc1ODIwNDM4OTAyMDEwMjczNzU5MTkxNjE5Nzk3MjQ1NjIwMzgyODk2NDQyNTYzMTI2MjQzMzM4OTQ1NTYzNTYyNzY1MTM0NzgwMjU4MjU5MzE2MzAyOTk4NTM1OTE4NDc2Njc4MzY0OTM0MzcyMDc2NjM1NTk0OTEwOTEwODIyNzM5ODM2OTczNjYwNTgzNTIxODcwODkxNDA1ODA2NzMzMjg2MTc4MDg4MDQ4NTYxMDExOTYzNjYwMjg5OTM2NDc3MzA2MDAyODU5MDQwMTY3NzA5NzkyMTcyMTAzOTgyOTY4MTc0NjYwOTA4ODI1NjMxMTM4NzQ5NDU5NTAwODAyNTYzNzg3NzE3MDQ1ODYxNTgyMTI5MTkzNDcwMDc2MjU4MjIwMDU5MjE3ODg2ODc0Il0sIFsibWFzdGVyX3NlY3JldCIsICIxMjEyMTExOTA0NjkyODE3NDc5NDM5NTQ4Mjc4MjY4OTI3OTY5NjI4MzMyMDA5OTMxOTcyMDAxODE3MzY1MzU2NTMxNzU1NjE5NDQ0NTkwMzY1Mjc1NDY1MTc4MTQ4NDk3OTUzNDUyNTYyNzQ2MDQwODIyMTk3OTQ1ODM3MDg5OTQ0NzUxMTQxODYwNDg5NDgyMjE3ODI3Nzk3ODMzMzI1ODU4NjIyODkzNjIwNTA5NTUyNDIyMDUyNzg5OTcyMTM2MzY4MTk2MzE5NjQ1MTUwMTQ2NTA2OTA0ODMyNzA3NDQ2NjI2NjAyMTUxNzQ4MzI2Mjg0MTA3Njk2ODY2MDQ3NDQ3NTAzMDcyNjU3MjQyMDkxMDI5OTMyOTYzMTM4NTg1OTIxODc5NDEyMDkzMDcwODc4OTA5MjcyMTYzNDgzNjA5MTg3NTUwNDUyNDQxNDE3MDEzMzA1Njg1Mjg3NDgyMDc4OTEzODYwOTMyMzc5NTU3ODg4MTcyMzA0NDcwMzQxMTQ5Mjc1MDUyNzIxOTk2MTgzNzUyNzg5Mzc3MDA3NTM2ODM4OTAwNTIxMjE2MTkwMzk2NTMwMTU5MDAyOTM4MDAyMjQwOTA0MzA5OTc2NTA3NDY4ODg3ODgzODI1Njk4ODc3OTAwMjkwMTYxNzgwMzMxOTU1OTc3NjcwNzQ3MTA5Nzc2NDQyODgzNTU0NDcxOTUzODM0MjQ2NTIxMjE4NzE5OTgyNTM1MDc2OTcyNzA0MzgwODk4Njc4MTg0MzI0MDMzMDQ4NzY2MTMxNDY5MzYwODEyMzUzMjI3NTc2Mjc3ODY4NzQwOTUzNDM2MjEwMjMwMDU1MjgzNjEyOTYzOTEyNzMxMDczNTk0NzYwNzAxODAxNTc3Mjc1MTU4ODc4MDg5MzgwMTYzNzQyNzAzMzEyMjg3Il0sIFsibGFzdG5hbWUiLCAiMjc2MTg1MjA1OTkxNjM0OTM2MTE2ODk2MzI5OTIxMzY0NjI4MjQ3ODg4MTA0ODU0NzE0NzMxMTQ3OTkwNjI5NjUyNjgyMjIxMTk3MDY1MTg2OTI2NzcwNjExNjQ0NTcwNjc5MDczODgyNjIyMTQ2NDgwMTMxNDQxODUzNjk0NDczNTg0MTg5MDAyNDc2MDY0NTI4MTk0MjQ2Mzc3OTkwNjk4Mzk0NTg1OTYwMjUxMTI3ODA5MDYyNjM5OTYwNDkzODUyOTEwNjE4MDQ5NjkwODM3NTUwODMwNTkzMjUzNDU5NjQ5NTAxMDU4Mjg3MjE2MjUzNDg3NzI1ODEzMzc2OTQ5OTAxNzA5OTY2OTMxODYwMzQ0MjQwOTU2OTgyOTgyMjMzNzcyOTkzMDAyMzg0MDU2MjIwMTM0OTEyMDM5NzU4NTkzMTk2NjI5MzE5NzU4Mzc2ODM1MjY2NzIzMzkzOTUyOTAyMDY1NTA3NjU5NjA3MzY5Njg2MzE1MDIyMjgwNDM2ODg0MjE3MTM5OTU2NTcyODIxNjcxMzYxMDgzMjQxOTA5MTk3ODE2MjUxNDgyMTAzODE4ODIzMzQ2MzQxOTIwMTU2NDU1MTAxOTI5MjEzODcwMzEzNTE5MjM5Mjg2MzEwMzQ4Mjg0MDc5OTc5MjAwOTk3Nzc2MzEyNzUzMzU1MjcyNjEwNjQwOTU1Nzk5OTc2NjQyMTk1OTc3NDUyODQwODUzOTcxMDU3Mzc0MjUxMzA5ODI2ODkzNDg5MjIxNjc4NDM4Njg0MTU4NjA1ODg0MjczNjY2OTg1NDM4NTIyODk4ODY3MTkwNDk1ODE2OTA2NTY1NjY4MzkxNzQwNDYyMTUyMDkzNDYwOTYzODY5MDgwNjYxMzMyMjc1NzY1NjMwMzYxOTU4NDE5MTA3NDY2MTcyIl0sIFsibWlkZGxlbmFtZSIsICI0MjQ2OTMxOTI3MjQyODI4MDYxOTM3NzY5MDA4NjUxMjMzODgzNjg2NTY4NTU1NDgyOTEzNTU0ODgxMDAyMzI5MzI0MTEwMjAxNDAwOTA2MzM3Mzc5Mjc1OTEyNTU0OTU4MTgyOTc0OTMxOTMzMTU0NDg4MzA1MjcxOTg4MDk1NjY4Mjk2Nzc5MjI2MDg0NzQ1OTU2MTYwMjAwODAxNzc3MzM3MzQ1MzI5OTIzNjc0Nzk1NDk4NTk5NzA3NjgxOTI0NDQ2ODAzOTQ4ODI3NjIwMTU1OTgzNjAzNDcxMjc3NjEzNDA1NzMyNjQ4NjI5MzQ3NzUzODUxNDc5NTA5NDYwMzc3NjA1MDY4MTc2ODg1MDE2MTA5MjY4MDUyMjU3MjExNTU3NDIzNjgwMDA0NzQ3NTYwOTExNTcyMjI5MzA3Nzk2MDQwOTgxMTI2MzYwNjg1NTIxODI0NzQwODEwNzMyMDc4NDM2NjI0MjI4NDEzNzE2OTYyMzYzMjkwMjYyMDEyNDU1MzY0ODIyNzMyMTY0NTEzNzYyNTI2NzQyNDQyODI4Mzk3Nzg5MTEwNzkzODE1MzU5NDI2OTEyNjgxODY0MzI2OTQ2NDA0Mjc1Mjk2NTc5NTc0NzkwNzMyMzgyMzkzNzA3NDY2NDMxOTA2MzE2MjUxMTE4ODgyNTQ4MDQ3MDgzMTQ0OTYxMDc3MTk1MzQ5NTU2NjU3NTQ2NDQxNzAwNDY2ODExMjY1OTg0NzQ1NjIwNzI4Njc1NTMyMzAwODU0ODcwNDgyNDM0NjgwMjk0OTAwNjg0ODA5NTc1NzUxMDcwNTc1ODI3NTg0Nzc2OTgxODY3NjYzMzY4NzI4Mjc2MjczNDQxODY0NjM5MDAxMjY2NzA0MDYxMDk3MjQxMDA3NDMzMjkwOTMyMjIwNDMzMTIzMTEiXV19LCAibm9uY2UiOiAiMTAxMDE1NDM1NTE4ODM5MzIyNjA0MTI2NiJ9"
//         }
//       }
//     ],
//     "comment": "create automated credential exchange",
//     "credential_preview": {
//       "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
//       "attributes": [
//         {
//           "name": "firstname",
//           "value": "Hidde-Jan"
//         },
//         {
//           "name": "middlename",
//           "value": "van"
//         },
//         {
//           "name": "lastname",
//           "value": "Jongsma"
//         }
//       ]
//     }
//   },
//   "credential_exchange_id": "8c805637-a89d-497f-92e5-e5f8bfa825ac",
//   "credential_proposal_dict": {
//     "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/propose-credential",
//     "@id": "063aa27b-e65e-4c6f-b321-d743642b5792",
//     "schema_issuer_did": "Pm8J9C3BLVSbqBQpVYoJho",
//     "cred_def_id": "Pm8J9C3BLVSbqBQpVYoJho:3:CL:31:default",
//     "credential_proposal": {
//       "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview",
//       "attributes": [
//         {
//           "name": "firstname",
//           "value": "Hidde-Jan"
//         },
//         {
//           "name": "middlename",
//           "value": "van"
//         },
//         {
//           "name": "lastname",
//           "value": "Jongsma"
//         }
//       ]
//     },
//     "schema_name": "NameCredential",
//     "schema_version": "0.0.1",
//     "comment": "string",
//     "issuer_did": "Pm8J9C3BLVSbqBQpVYoJho",
//     "schema_id": "Pm8J9C3BLVSbqBQpVYoJho:2:NameCredential:0.0.1"
//   },
//   "auto_issue": true,
//   "schema_id": "Pm8J9C3BLVSbqBQpVYoJho:2:NameCredential:0.0.1",
//   "auto_remove": true
// }

@Injectable()
export class IndyService implements ConnectorService {
  name = 'indy';

  private logger: Logger;

  constructor(
    @InjectRepository(IndySchema)
    private schemasRepository: Repository<IndySchema>, // private configService: ConfigService,
    @InjectRepository(IndyInvitation)
    private invitationsRepository: Repository<IndyInvitation>,
    private httpService: HttpService,
  ) {
    this.logger = new Logger(IndyService.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async registerOrganization(organization: Organization) {
    // We don't need to do anything for Indy.
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canIssueCredentialRequest(request: CredentialIssueRequest) {
    // We cannot issue IRMA credentials right now.
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canVerifyCredentialRequest(request: CredentialVerifyRequest) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleIssueCredentialRequest(issueRequest: CredentialIssueRequest) {
    throw new NotImplementedException('Cannot issue Indy credentials');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleVerifyCredentialRequest(verifyRequest: CredentialVerifyRequest) {
    throw new NotImplementedException('Cannot verify Indy credentials');
  }

  async handleVerifyCredentialDisclosure() {
    throw new NotImplementedException('Cannot verify Indy credentials');
  }

  async findAllSchemas() {
    return this.schemasRepository.find();
  }

  async createSchema(schemaData: Partial<IndySchema>) {
    const schema = new IndySchema();
    schema.name = schemaData.name;
    schema.version = schemaData.version;
    schema.attributes = schemaData.attributes;
    await this.createSchemaAndCredDef(schema);

    return this.schemasRepository.save(schema);
  }

  async createInvitation() {
    const invitation = new IndyInvitation();
    invitation.identifier = IndyInvitation.randomIdentifier();

    const response = await this.httpService
      .post<IndyConnectionResponse>(
        this.indyUrl('connections/create-invitation'),
        {
          alias: invitation.identifier,
        },
      )
      .toPromise();
    invitation.connectionId = response.data.connection_id;
    invitation.connectionResponse = response.data;
    return this.invitationsRepository.save(invitation);
  }

  protected async createSchemaAndCredDef(schema: IndySchema) {
    this.logger.debug('Creating indy schema', schema.name);

    const schemaResponse = await this.httpService
      .post<IndySchemaResponse>(this.indyUrl('schemas'), {
        attributes: schema.attributes,
        // eslint-disable-next-line @typescript-eslint/camelcase
        schema_name: schema.name,
        // eslint-disable-next-line @typescript-eslint/camelcase
        schema_version: schema.version,
      })
      .toPromise();

    this.logger.debug('Created indy schema', schemaResponse.data.schema_id);

    schema.indySchemaId = schemaResponse.data.schema_id;

    this.logger.debug('Creating indy credDef', schema.indySchemaId);

    const credDefResponse = await this.httpService
      .post<IndyCredDefResponse>(this.indyUrl('credential-definitions'), {
        // eslint-disable-next-line @typescript-eslint/camelcase
        revocation_registry_size: 1000,
        // eslint-disable-next-line @typescript-eslint/camelcase
        schema_id: schema.indySchemaId,
        // eslint-disable-next-line @typescript-eslint/camelcase
        support_revocation: false,
        tag: 'default',
      })
      .toPromise();

    this.logger.debug(
      'Created indy credDef',
      credDefResponse.data.credential_definition_id,
    );

    schema.indyCredentialDefinitionId =
      credDefResponse.data.credential_definition_id;

    return schema;
  }

  protected getConnection(did: string) {
    this.httpService.get(this.indyUrl('connections'), {
      // eslint-disable-next-line @typescript-eslint/camelcase
      params: { their_did: did },
    });
  }

  protected indyUrl(path: string) {
    return `http://acapy:9001/${path}`;
  }
}
