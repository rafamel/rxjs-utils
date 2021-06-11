## [0.0.6](https://github.com/rafamel/multitude/compare/v0.0.5...v0.0.6) (2021-06-11)


### Bug Fixes

* **push:** fix filter operator types ([41e7bf9](https://github.com/rafamel/multitude/commit/41e7bf9a29bd9e71e1315436621d497e64d64c24))



## [0.0.5](https://github.com/rafamel/multitude/compare/v0.0.4...v0.0.5) (2020-12-22)


### Bug Fixes

* **push:** fixes take operator leak ([ce10ecc](https://github.com/rafamel/multitude/commit/ce10ecc54605a1e242bc7abc0e55ba1bef552b46))



## [0.0.4](https://github.com/rafamel/multitude/compare/v0.0.3...v0.0.4) (2020-12-20)


### Code Refactoring

* **push:** renames changes operator as compare ([e8c0671](https://github.com/rafamel/multitude/commit/e8c067118c9042aa879d53b374280373e1a9a24c))


### Features

* **push:** adds start operator ([51de47f](https://github.com/rafamel/multitude/commit/51de47f75e5e2614e06a3d75c1f44593f45f7d99))


### BREAKING CHANGES

* **push:** The changes operator is now exported as compare



## [0.0.3](https://github.com/rafamel/multitude/compare/v0.0.2...v0.0.3) (2020-12-18)


### Bug Fixes

* **push:** fixes mergeMap operator types ([53a9fd4](https://github.com/rafamel/multitude/commit/53a9fd471e559a21491e60c0c8b1ad1e76a537b8))


### Features

* **push:** adds start operator ([d34bc11](https://github.com/rafamel/multitude/commit/d34bc11a41a96fc9017871da15afbdf17624f37b))



## [0.0.2](https://github.com/rafamel/multitude/compare/v0.0.1...v0.0.2) (2020-12-15)


### Features

* **push:** adds first consume operator ([94a0b30](https://github.com/rafamel/multitude/commit/94a0b30715969cfd55a735501832a74d0ea9d9c5))



## 0.0.1 (2020-12-12)


### Bug Fixes

* **definitions:** fixes push definitions ([78b69e5](https://github.com/rafamel/multitude/commit/78b69e5b2c0ec3e87a44b74bb12d39f2c03fa5af))
* **definitions:** fixes push definitions ([625d4a6](https://github.com/rafamel/multitude/commit/625d4a6f65b72ab78db2f975503bdef745c9398e))
* **deps:** updates dependencies ([e4a187f](https://github.com/rafamel/multitude/commit/e4a187f7eddf630a86241b64ab08d4f687d84ce6))
* **deps:** updates dependencies ([887d284](https://github.com/rafamel/multitude/commit/887d28437b702421548984770007d12c6e4a4170))
* **deps:** updates type-core version ([8d8f67c](https://github.com/rafamel/multitude/commit/8d8f67c7dc76309cd26abd95deea02154b005595))
* **helpers:** fixes FailureManager ([82eebf3](https://github.com/rafamel/multitude/commit/82eebf38add3be59a9d3cf4d4f5ca88f3aea9666))
* **push:** fixes Broker promise methods when passed via Hearback.start ([05da612](https://github.com/rafamel/multitude/commit/05da6125bbb0fa1a9cdea6d1a6aa18e6368b35db))
* **push:** fixes circular dependencies ([ef071be](https://github.com/rafamel/multitude/commit/ef071be2e04183d1aa82d5293f99004d69593cb7))
* **push:** fixes from creation function ([cfcb0eb](https://github.com/rafamel/multitude/commit/cfcb0ebe72e9bb23fc28de81e24e410df9555dae))
* adds missing dependencies ([ecb6a8c](https://github.com/rafamel/multitude/commit/ecb6a8cbaed1d050fc42338456df325532ee1e96))
* **push:** fixes circular dependencies ([b735828](https://github.com/rafamel/multitude/commit/b735828ade8b531d71770dcaec486a6eb2bbe35b))
* **push:** fixes PushableStream ([7ca929b](https://github.com/rafamel/multitude/commit/7ca929b1fd2a0d00758021f702d917a4056b0852))
* aligns PushStream.from and reference Observable.from with Observable spec ([a83dbc6](https://github.com/rafamel/multitude/commit/a83dbc6c09e956081b354effc7a2edb5243068f3))
* **deps:** fixes dangling and pending dependencies ([d6e7dd1](https://github.com/rafamel/multitude/commit/d6e7dd194196805c95ab60b42f2afb8755fc03c1))
* **PushStream:** fixes consumption as a regular Stream ([f8b737b](https://github.com/rafamel/multitude/commit/f8b737b4678ffaef58791cf463c803d4ef6365bd))
* **PushStream:** fixes errors blocking teardown's retrieval/execution, adds safe mode ([9d52424](https://github.com/rafamel/multitude/commit/9d5242410f265b3c09e10df381fb8a62053ebb54))
* **PushStream:** fixes Subscription resolution before Subscriber has finalized executing ([b8d78f5](https://github.com/rafamel/multitude/commit/b8d78f5d695ae0f9a82c7217bcdaeb388c0df53b))
* **PushStream:** raises error when Talkback.error() throws with a synchronous final error ([abc523a](https://github.com/rafamel/multitude/commit/abc523aff230c547e7ee79d31597f94f9ff46b6a))
* **PushStream:** Subscription.closed is true as soon as the consumer Talkback is closed ([91d8fc4](https://github.com/rafamel/multitude/commit/91d8fc45036d7e092a02f1084cb60649255c36db))
* **streams:** fixes Stream ([cef2671](https://github.com/rafamel/multitude/commit/cef2671348a6dbfd8fe4509038ea1843c96f9c54))
* ensures methods are not accessed twice for the same SubscriptionObserver/Talkback call ([3e021d3](https://github.com/rafamel/multitude/commit/3e021d32ecddff35400b1bebf40ce490ea953e1d))
* fixes Observable.subscribe ([4d8cf95](https://github.com/rafamel/multitude/commit/4d8cf951826120311ebeca224ba9cd96e2a87cb3))
* fixes SubscriptionObserver.complete ([5106de6](https://github.com/rafamel/multitude/commit/5106de604a680fcf6b8c77707763e4743060c9ea))
* fixes SubscriptionObserver.error ([198db82](https://github.com/rafamel/multitude/commit/198db82a6f73a092cafd0c84cbc7fa9adadfc5bd))
* fixes SubscriptionObserver.next ([0b9ad99](https://github.com/rafamel/multitude/commit/0b9ad990ad65e7c6e14793dc688f08cb4bc3f786))


### Features

* **pull:** implements Pullable.from; adds Pull.LikeConstructor, Pull.Convertible, Pull.Like definitions; adds pull type guards ([3bf476d](https://github.com/rafamel/multitude/commit/3bf476dfe5882efd39e7fe1a5df8245c26e62dcd))
* **push:** adds catches operator ([095c13b](https://github.com/rafamel/multitude/commit/095c13b6d0bbbfdec162c4b2badcf21c72a787e8))
* **push:** adds changes operator ([dba1845](https://github.com/rafamel/multitude/commit/dba1845e71e019b4e9c098a404d468b7ae08bed5))
* **push:** adds combine creation function ([be92b7a](https://github.com/rafamel/multitude/commit/be92b7ad6bf554ace319965c9a92c447f8b56f63))
* **push:** adds connect operator ([1e0fa15](https://github.com/rafamel/multitude/commit/1e0fa1530ac562f914701a2efda34582debe021f))
* **push:** adds ConnectableStream ([eaf0c51](https://github.com/rafamel/multitude/commit/eaf0c51696bf1a6c65914f4783516f4723210f92))
* **push:** adds creators fromEvent, defer, throws ([28c4b12](https://github.com/rafamel/multitude/commit/28c4b12092c6d694ac7acba9630d058d54a833d6))
* **push:** adds debounce operator ([42e8c49](https://github.com/rafamel/multitude/commit/42e8c49ce706bb9fc7a8ac499290dbf376e99276))
* **push:** adds delay operator ([071c266](https://github.com/rafamel/multitude/commit/071c266cdfe1da74b9b911de36456c8d2e9e870c))
* **push:** adds distinct operator ([cb7801d](https://github.com/rafamel/multitude/commit/cb7801d459f5b280b278b91f651de8f9fc63ae3d))
* **push:** adds extract operator ([a6d2120](https://github.com/rafamel/multitude/commit/a6d2120a34452428cfacbe257bbe4e8999d11055))
* **push:** adds filter operator ([f658af0](https://github.com/rafamel/multitude/commit/f658af0cf345353462b9db44291b5584b5c4f6e3))
* **push:** adds group operator ([87e66ac](https://github.com/rafamel/multitude/commit/87e66ac7b98eeacc71f655b81076119b5ed722d9))
* **push:** adds interval ([b7e46ee](https://github.com/rafamel/multitude/commit/b7e46eefc79fd58da8736881c806b35926af96cb))
* **push:** adds map operator ([4c00023](https://github.com/rafamel/multitude/commit/4c0002355165eb900e67fb42ae14e390c1903ee9))
* **push:** adds merge ([ce060a6](https://github.com/rafamel/multitude/commit/ce060a644c487a5983ef64fc90bd260ae35473e1))
* **push:** adds mergeMap operator ([3f5f6d8](https://github.com/rafamel/multitude/commit/3f5f6d86fd85db9e73c59b1a0beb80932aa94626))
* **push:** adds Multicast push definition and class; refactors Subject class and connect, share operators ([3075b55](https://github.com/rafamel/multitude/commit/3075b557d84cee0532d2de5e08d64f67d8629ed1))
* **push:** adds omit, pick operators ([3254d45](https://github.com/rafamel/multitude/commit/3254d451e25672923b746d9e9f8619a3fa8f42d0))
* **push:** adds onCloseSubscription to Hooks; adds Hooks class; improves hooks handling ([7aa1835](https://github.com/rafamel/multitude/commit/7aa183568db61bae037e0536023ce6bfbed41d3a))
* **push:** adds react hooks utils ([e64345f](https://github.com/rafamel/multitude/commit/e64345fa07198187a944774ac4fe17ec514949ee))
* **push:** adds replay for PushableStream; removes ConnectableStream ([a78fcc6](https://github.com/rafamel/multitude/commit/a78fcc676a30faca84be3061d13129507f3bd481))
* **push:** adds Router; deletes Forwarder; implements PushableStream, intercept w/ Router ([a939047](https://github.com/rafamel/multitude/commit/a9390470cb603690cdad94bdf55ae6665f513014))
* **push:** adds share operator ([549f567](https://github.com/rafamel/multitude/commit/549f5676fde9ccf3f0b1c8c2a64cf24f00a77bd6))
* **push:** adds skip operator ([5045ec0](https://github.com/rafamel/multitude/commit/5045ec06c4157ca485bf25f41571a3577d117ba8))
* **push:** adds take operator ([cedf7d4](https://github.com/rafamel/multitude/commit/cedf7d4aa0a9736a79aeaf01cfaec1b99477e85c))
* **push:** adds tap operator ([3854710](https://github.com/rafamel/multitude/commit/38547109e732aab03af4cc060e1907c245d1d905))
* **push:** adds timestamp operator ([9b1186b](https://github.com/rafamel/multitude/commit/9b1186ba2c415f95e86384f68ef0953d68b8cc8e))
* **push:** adds trail operator ([308d695](https://github.com/rafamel/multitude/commit/308d6953047c91cdb9016cf711640bd65449413d))
* **push:** deprecates Subject.start in favor or Subject.of ([d18c20b](https://github.com/rafamel/multitude/commit/d18c20bfc8949d45c9fefb1e6d07b7f40b0c6489))
* exports compliant Observable w/ extensions; removes PushStream; renames PushableStream to Subject; renames PullableStream to Pullable ([76d59e5](https://github.com/rafamel/multitude/commit/76d59e5a856dddbec4c0bba194ccd16dae458a7f))
* **creation:** adds combine ([06ffbc5](https://github.com/rafamel/multitude/commit/06ffbc57d607584117c507144df7d85f099cb441))
* **definitions:** adds definitions for iterables ([fead788](https://github.com/rafamel/multitude/commit/fead788a7d173e1061891667cbd624389fb1dead))
* **iterables:** implements PullStream ([71b5178](https://github.com/rafamel/multitude/commit/71b51784e16b69edeacc95fe5e2406428bf9ebaa))
* **observable:** adds Observable implementation ([0b9f0da](https://github.com/rafamel/multitude/commit/0b9f0dad095827889672dc767e6133faa4c79781))
* **operators:** adds changes ([d1e23e1](https://github.com/rafamel/multitude/commit/d1e23e122f835ef452f719d306a7b5ecb2f9569f))
* **operators:** adds match ([8491c61](https://github.com/rafamel/multitude/commit/8491c612ee0734e0deb9b94bbbbc12ac71e90f4e))
* **operators:** adds omit ([26de254](https://github.com/rafamel/multitude/commit/26de2548f90e03c6648f18ca119250a3f266b28a))
* **operators:** adds pick ([9c50989](https://github.com/rafamel/multitude/commit/9c5098985ea81490881204944fc4e76200205ec1))
* **operators:** adds select ([afac894](https://github.com/rafamel/multitude/commit/afac894421f86a2b6277743b036b1ba6df746744))
* **push:** adds operate and forward utils ([ac17f47](https://github.com/rafamel/multitude/commit/ac17f4714405eaa4ed061c96afa4420ee70e0a4d))
* **push:** adds switchMap operator ([7dcd637](https://github.com/rafamel/multitude/commit/7dcd6370f310853ed826b187a9ec14344552f67b))
* **push:** adds terminate to PushStream Hearback ([8993f22](https://github.com/rafamel/multitude/commit/8993f22052ef9b7d426309a9522f99a3723768bc))
* **push:** adds transform and intercept utils, redesigns operate, replaces forward with Forwarder ([7028e81](https://github.com/rafamel/multitude/commit/7028e81effe6915343c1b5929b2ec695829e369c))
* **push:** exports of, from as functions ([38083f5](https://github.com/rafamel/multitude/commit/38083f5299ef2699c9f0a7495bb18fcb344d0f86))
* **push:** exports operators ([74d48a4](https://github.com/rafamel/multitude/commit/74d48a4df2489843d7dceaceabd61f18f09bc1dc))
* **push:** from creates from PromiseLike ([ea38253](https://github.com/rafamel/multitude/commit/ea38253eca5290f0d63ca4a75896cf7f044fce23))
* **push:** implements Observable and PushStream independently ([4c44fcd](https://github.com/rafamel/multitude/commit/4c44fcd122bb5b92f0b4ed390906a4479123568a))
* **push:** implements Promise based Broker (Subscription) for PushStream ([363ac24](https://github.com/rafamel/multitude/commit/363ac24ddf08075da657ae60a5a0d715addc6343))
* **push:** improves performance ([dd2262f](https://github.com/rafamel/multitude/commit/dd2262fa1a3ae3d27af2f85bb85f840e033d1cf9))
* **push:** moves to a hook based error handling for Subscription; significant changes on types and PushStream behavior ([6b3f3fa](https://github.com/rafamel/multitude/commit/6b3f3fa1da34cebea5e7ee232345f91592a6a790))
* **push:** removes static methods from PushStream; adds Create ([6717e0f](https://github.com/rafamel/multitude/commit/6717e0f4f5d6f01c30d1a43c3ad93b3a15a0579f))
* **PushStream:** removes safe mode ([54ff3f7](https://github.com/rafamel/multitude/commit/54ff3f746d08e74a051aab802fb2b1003bdecbbc))
* **PushStream:** Subscription is a lazy Promise, unsubscribes if rejected when listened to ([fbf0da9](https://github.com/rafamel/multitude/commit/fbf0da93cd45d54a341ece28dcf69485cdc86c1b))
* **stream:** adds Stream implementation ([eac1dc6](https://github.com/rafamel/multitude/commit/eac1dc678a8066baa5bfc34d1d39bebef606f4fa))
* **streams:** adds PushableStream ([c2d85ed](https://github.com/rafamel/multitude/commit/c2d85ed2f3e4d451486b47e58e3898744f0dfe61))
* **streams:** creates Push specific ObserverTalkback ([5b3104a](https://github.com/rafamel/multitude/commit/5b3104ad0e1af298841069a3067a4a8742fb4058))
* **utils:** adds type guards ([37204d9](https://github.com/rafamel/multitude/commit/37204d929c1885a831d03a4c5dd434be9241952e))
* adds closed getter to Core Talkback ([8b67d18](https://github.com/rafamel/multitude/commit/8b67d188a8741f09902e5cb8f77c43c503106e3d))
* adds Core Stream definitions ([ce4a9da](https://github.com/rafamel/multitude/commit/ce4a9da89f40c1bead0126c9deabaef293f8d99e))
* adds Push Stream definitions ([809fb96](https://github.com/rafamel/multitude/commit/809fb96f525ef31c72f53671a87eedd6837db6fa))
* adds PushStream implementation ([4e4a4d3](https://github.com/rafamel/multitude/commit/4e4a4d3ab920f5c5ba61656ad065778049ca9457))
* adds Stream implementation ([7b34134](https://github.com/rafamel/multitude/commit/7b34134436b6a1038e62e0acf8188dd88ec38e45))
* aligns PushStream to ES Observable spec ([4f71df7](https://github.com/rafamel/multitude/commit/4f71df7250b012eb989a870129ed662a954ae202))
* defines and implements pull streams ([6eff803](https://github.com/rafamel/multitude/commit/6eff803363b06d9724d3ac8ba35918ceef685704))
* defines and implements pull streams as provider data returning only ([889b444](https://github.com/rafamel/multitude/commit/889b444071bd562c60a50f7350cdd94f6da161bc))
* forks w/ Observable reference implementation ([66c3320](https://github.com/rafamel/multitude/commit/66c332023734eaf24ccf6b82aeb5120f8f94498f))
* removes independent Observable reference implementation ([3403b7c](https://github.com/rafamel/multitude/commit/3403b7cd751a6dfc92964c7e6b5765607b0e6721))
* Talkback doesn't allow manual early termination once another method has been called that deterministically will terminate ([77fb909](https://github.com/rafamel/multitude/commit/77fb909c974bfbf780292cc4b241b2d75343f8bb))
* **utils:** adds isIterable, isAsyncIterable, isObservable ([af97988](https://github.com/rafamel/multitude/commit/af97988b4dd474e2958761989674036297397af3))



