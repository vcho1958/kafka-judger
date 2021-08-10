# kafka-judger  


```bash
cd kafka-docker  
docker compose up  
```
콘솔에서 로그를 보며  
토픽 생성이 다 될 때 까지 대기 후  
![1](https://github.com/vcho1958/kafka-judger/blob/main/1.PNG)  
![2](https://github.com/vcho1958/kafka-judger/blob/main/2.PNG)  
```bash
cd ..  
docker compose up  
```
  
콘솔에서 로그를 확인하여 consumer가 파티션에 할당될 때 까지 대기  
  ![3](https://github.com/vcho1958/kafka-judger/blob/main/3.PNG)  
http://localhost:4500 접속  
요청버튼을 눌러 테스트  
  
할당된 카프카 컨슈머 호스트와  
진행률이 실시간으로 출력된다.  
현재 내부 로직이 SetInterval을 setTimeout을 이용하여 종료시점을 알 수 있게 하는 방식이기 때문에  
불가피하게 await를 사용할 수 없어서 동시에 여러개의 메세지가 처리되는 것으로 파악되나  
추후 judger와 연동하여 await를 사용하면 host한개당 1개씩만 처리될 것으로 보임  
![4](https://github.com/vcho1958/kafka-judger/blob/main/4.png)  
